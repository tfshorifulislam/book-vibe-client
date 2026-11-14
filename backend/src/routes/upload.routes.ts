import type { NextFunction, Request, Response } from "express";
import { Router } from "express";

import { prisma } from "@/lib/db";
import {
  createUploadSignature,
  deleteImage,
  extractCloudinaryPublicId,
  validateCloudinaryAssetUrl,
  verifyCloudinaryAsset,
} from "@/lib/storage";
import { requireAuth } from "@/middleware/auth";
import { ApiError } from "@/middleware/error";

const router = Router();

// POST /api/upload/sign or GET /api/upload/sign: Generates signed parameters for direct browser upload
router.all("/upload/sign", requireAuth, async (req, res, next) => {
  try {
    const rawFolder = (req.body?.folder ||
      req.query?.folder ||
      "bookhand") as string;
    const folder = typeof rawFolder === "string" ? rawFolder : "bookhand";

    if (!folder.startsWith("bookhand")) {
      throw new ApiError(
        "Upload folder must reside within bookhand namespace.",
        422,
      );
    }

    const signatureData = createUploadSignature(folder);
    return res.json({ success: true, data: signatureData });
  } catch (error) {
    next(error);
  }
});

// Safely cleans up replaced Cloudinary asset without affecting database persistence
async function safelyCleanupOldAsset(
  oldUrl: string | null | undefined,
  newUrl: string,
) {
  if (!oldUrl || typeof oldUrl !== "string" || oldUrl === newUrl) return;
  // Ensure we never delete external URLs or assets outside BookHand Cloudinary namespace
  if (!validateCloudinaryAssetUrl(oldUrl)) return;
  const oldPublicId = extractCloudinaryPublicId(oldUrl);
  if (!oldPublicId || !oldPublicId.startsWith("bookhand")) return;

  try {
    await deleteImage(oldPublicId);
  } catch (error) {
    console.warn(
      `[Upload Cleanup] Failed to delete replaced asset ${oldPublicId}:`,
      error,
    );
  }
}

// POST /api/upload/confirm or POST /api/upload: Validates and persists uploaded Cloudinary asset in DB
const handleUploadConfirm = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { secureUrl, publicId, entity, entityId } = req.body || {};

    if (!secureUrl || typeof secureUrl !== "string") {
      throw new ApiError("A valid Cloudinary secure_url is required.", 422);
    }

    if (!publicId || typeof publicId !== "string") {
      throw new ApiError("A valid Cloudinary public_id is required.", 422);
    }

    // 1. Validate URL structure against Cloudinary configuration
    if (!validateCloudinaryAssetUrl(secureUrl)) {
      throw new ApiError(
        "URL does not match authorized Cloudinary cloud domain.",
        422,
      );
    }

    const userId = req.user!.userId;
    const userRole = (req.user?.role || "").toUpperCase();

    // 2. Role and Ownership Authorization Guards (fail fast before network ping)
    if (entity === "banner" && userRole !== "ADMIN") {
      throw new ApiError(
        "Admin privileges required for banner management.",
        403,
      );
    }

    if (entity === "book" && entityId) {
      const book = await prisma.book.findFirst({
        where: {
          id: entityId,
          ...(userRole !== "ADMIN" ? { shop: { ownerId: userId } } : {}),
        },
        select: { id: true },
      });
      if (!book) {
        throw new ApiError("Book listing not found or not owned by user.", 403);
      }
    }

    // 3. Validate asset existence and mime type on Cloudinary
    const isValid = await verifyCloudinaryAsset(secureUrl);
    if (!isValid) {
      throw new ApiError(
        "Cloudinary asset could not be verified or is not a valid image.",
        422,
      );
    }

    // 4. Persist asset in PostgreSQL through Prisma based on entity
    if (entity === "avatar" || (!entity && !entityId)) {
      // Default: Associate with authenticated user's profile avatar
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatar: true },
      });
      const oldUrl = existingUser?.avatar;

      await prisma.user.updateMany({
        where: { id: userId },
        data: { avatar: secureUrl },
      });

      await safelyCleanupOldAsset(oldUrl, secureUrl);
    } else if (entity === "book") {
      if (entityId) {
        // Book cover update: verify seller ownership or admin role
        const book = await prisma.book.findFirst({
          where: {
            id: entityId,
            ...(userRole !== "ADMIN" ? { shop: { ownerId: userId } } : {}),
          },
          select: { id: true, coverImage: true },
        });
        if (!book) {
          throw new ApiError(
            "Book listing not found or not owned by user.",
            403,
          );
        }
        const oldUrl = book.coverImage;

        await prisma.book.updateMany({
          where: { id: entityId },
          data: { coverImage: secureUrl },
        });

        await safelyCleanupOldAsset(oldUrl, secureUrl);
      }
      // If no entityId, asset is confirmed and staged for book creation
    } else if (entity === "shop_logo") {
      const shop = await prisma.shop.findUnique({
        where: { ownerId: userId },
        select: { logo: true },
      });
      const oldUrl = shop?.logo;

      await prisma.shop.updateMany({
        where: { ownerId: userId },
        data: { logo: secureUrl },
      });

      await safelyCleanupOldAsset(oldUrl, secureUrl);
    } else if (entity === "shop_banner") {
      const shop = await prisma.shop.findUnique({
        where: { ownerId: userId },
        select: { banner: true },
      });
      const oldUrl = shop?.banner;

      await prisma.shop.updateMany({
        where: { ownerId: userId },
        data: { banner: secureUrl },
      });

      await safelyCleanupOldAsset(oldUrl, secureUrl);
    } else if (entity === "banner") {
      if (userRole !== "ADMIN") {
        throw new ApiError(
          "Admin privileges required for banner management.",
          403,
        );
      }
      if (entityId) {
        const banner = await prisma.banner.findUnique({
          where: { id: entityId },
          select: { image: true },
        });
        if (!banner) {
          throw new ApiError("Banner not found.", 404);
        }
        const oldUrl = banner.image;

        await prisma.banner.updateMany({
          where: { id: entityId },
          data: { image: secureUrl },
        });

        await safelyCleanupOldAsset(oldUrl, secureUrl);
      }
      // If no entityId, asset is confirmed and staged for banner creation
    }

    return res.json({
      success: true,
      data: {
        url: secureUrl,
        publicId,
      },
    });
  } catch (error) {
    next(error);
  }
};

router.post("/upload/confirm", requireAuth, handleUploadConfirm);
router.post("/upload", requireAuth, handleUploadConfirm);

// DELETE /api/upload: Authorized deletion of Cloudinary assets and DB sync
const handleUploadDelete = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawTarget =
      req.body?.url ||
      req.body?.publicId ||
      req.body?.target ||
      req.query?.url ||
      req.query?.publicId ||
      req.params?.id;

    const target = Array.isArray(rawTarget) ? rawTarget[0] : rawTarget;
    if (!target || typeof target !== "string") {
      throw new ApiError(
        "Image URL or public ID is required for deletion.",
        422,
      );
    }

    const publicId = extractCloudinaryPublicId(target);
    if (!publicId) {
      throw new ApiError("Invalid public ID or URL format.", 422);
    }

    const userId = req.user!.userId;
    const userRole = (req.user?.role || "").toUpperCase();

    // Authorization & Ownership Verification:
    // Non-admin users can ONLY delete assets belonging to their user account, shop, or books
    if (userRole !== "ADMIN") {
      const isUserAvatar = await prisma.user.findFirst({
        where: { id: userId, avatar: { contains: publicId } },
        select: { id: true },
      });

      const isUserShopAsset = await prisma.shop.findFirst({
        where: {
          ownerId: userId,
          OR: [
            { logo: { contains: publicId } },
            { banner: { contains: publicId } },
          ],
        },
        select: { id: true },
      });

      const isUserBookAsset = await prisma.book.findFirst({
        where: {
          shop: { ownerId: userId },
          coverImage: { contains: publicId },
        },
        select: { id: true },
      });

      if (!isUserAvatar && !isUserShopAsset && !isUserBookAsset) {
        throw new ApiError(
          "You do not have permission to delete this asset.",
          403,
        );
      }
    }

    // 1. Delete asset from Cloudinary
    const deleted = await deleteImage(publicId);

    // 2. Safely clear corresponding database records
    await prisma.user.updateMany({
      where: { avatar: { contains: publicId } },
      data: { avatar: null },
    });
    await prisma.shop.updateMany({
      where: { logo: { contains: publicId } },
      data: { logo: null },
    });
    await prisma.shop.updateMany({
      where: { banner: { contains: publicId } },
      data: { banner: null },
    });
    await prisma.book.updateMany({
      where: { coverImage: { contains: publicId } },
      data: { coverImage: null },
    });
    await prisma.banner.updateMany({
      where: { image: { contains: publicId } },
      data: { image: null },
    });

    return res.json({ success: true, data: { deleted } });
  } catch (error) {
    next(error);
  }
};

router.delete("/upload", requireAuth, handleUploadDelete);
router.delete("/upload/:id", requireAuth, handleUploadDelete);

export default router;
