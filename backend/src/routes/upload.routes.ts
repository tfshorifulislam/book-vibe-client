import { randomUUID } from "node:crypto";
import { Router } from "express";
import multer from "multer";

import { deleteImage, uploadImage } from "@/lib/storage";
import { requireAuth } from "@/middleware/auth";
import { ApiError } from "@/middleware/error";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const ALLOWED_MIME = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

// POST /api/upload
router.post(
  "/upload",
  requireAuth,
  upload.single("file"),
  async (req, res, next) => {
    try {
      const file = req.file;
      if (!file) throw new ApiError("Choose an image to upload.", 422);

      const ext = ALLOWED_MIME.get(file.mimetype);
      if (!ext) {
        throw new ApiError(
          "Please upload a JPG, PNG, WebP, or AVIF image.",
          415,
        );
      }

      const filename = `${randomUUID()}.${ext}`;
      const url = await uploadImage(file.buffer, filename, file.mimetype);

      return res.json({ success: true, data: { url } });
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /api/upload
router.delete("/upload", requireAuth, async (req, res, next) => {
  try {
    const target = (req.body?.url ||
      req.body?.publicId ||
      req.query?.url ||
      req.query?.publicId) as string | undefined;

    if (!target) {
      throw new ApiError(
        "Image URL or public ID is required for deletion.",
        422,
      );
    }

    const deleted = await deleteImage(target);
    return res.json({ success: true, data: { deleted } });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/upload/:id
router.delete("/upload/:id", requireAuth, async (req, res, next) => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id) {
      throw new ApiError("Image ID is required for deletion.", 422);
    }

    const deleted = await deleteImage(id);
    return res.json({ success: true, data: { deleted } });
  } catch (error) {
    next(error);
  }
});

export default router;
