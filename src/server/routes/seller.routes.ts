import { Router } from "express";

import { prisma } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";
import { requireAuth, requireRole } from "@/server/middleware/auth";
import { ApiError } from "@/server/middleware/error";
import {
  bookSchema,
  couponSchema,
  payoutRequestSchema,
  shopSchema,
} from "@/lib/validators";

const router = Router();

// Require seller role for all seller routes
router.use("/seller", requireAuth, requireRole(["seller", "admin"]));

// ================= SELLER BOOKS =================

// GET /api/seller/books
router.get("/seller/books", async (req, res, next) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user!.userId },
      select: { id: true },
    });
    if (!shop) return res.json({ success: true, data: { books: [] } });

    const books = await prisma.book.findMany({
      where: { shopId: shop.id },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
        publisher: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: { books } });
  } catch (error) {
    next(error);
  }
});

// POST /api/seller/books
router.post("/seller/books", async (req, res, next) => {
  try {
    const input = bookSchema.parse(req.body);
    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user!.userId },
      select: { id: true },
    });
    if (!shop) throw new ApiError("Create your shop profile first.", 409);

    const [author, category, publisher] = await Promise.all([
      prisma.author.findUnique({ where: { id: input.authorId } }),
      prisma.category.findUnique({ where: { id: input.categoryId } }),
      input.publisherId
        ? prisma.publisher.findUnique({ where: { id: input.publisherId } })
        : Promise.resolve(null),
    ]);

    if (!author) throw new ApiError("Choose a valid author.", 422);
    if (!category) throw new ApiError("Choose a valid category.", 422);
    if (input.publisherId && !publisher) {
      throw new ApiError("Choose a valid publisher.", 422);
    }

    const slug =
      input.slug ||
      (await uniqueSlug(input.title, async (candidate) =>
        Boolean(await prisma.book.findUnique({ where: { slug: candidate } })),
      ));

    const book = await prisma.book.create({
      data: {
        ...input,
        slug,
        shopId: shop.id,
      },
    });

    return res.status(201).json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
});

// GET /api/seller/books/:id
router.get("/seller/books/:id", async (req, res, next) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user!.userId },
      select: { id: true },
    });
    if (!shop) throw new ApiError("Book not found.", 404);

    const book = await prisma.book.findFirst({
      where: { id: req.params.id, shopId: shop.id },
      include: { author: true, category: true, publisher: true },
    });
    if (!book) throw new ApiError("Book not found.", 404);

    return res.json({ success: true, data: book });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/seller/books/:id
router.patch("/seller/books/:id", async (req, res, next) => {
  try {
    const input = bookSchema.partial().parse(req.body);
    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user!.userId },
      select: { id: true },
    });
    if (!shop) throw new ApiError("Book not found.", 404);

    const updated = await prisma.book.updateMany({
      where: { id: req.params.id, shopId: shop.id },
      data: input,
    });
    if (updated.count === 0) throw new ApiError("Book not found.", 404);

    return res.json({ success: true, message: "Book updated." });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/seller/books/:id
router.delete("/seller/books/:id", async (req, res, next) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user!.userId },
      select: { id: true },
    });
    if (!shop) throw new ApiError("Book not found.", 404);

    await prisma.book.deleteMany({
      where: { id: req.params.id, shopId: shop.id },
    });

    return res.json({ success: true, message: "Book deleted." });
  } catch (error) {
    next(error);
  }
});

// ================= SELLER ORDERS =================

// GET /api/seller/orders
router.get("/seller/orders", async (req, res, next) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user!.userId },
      select: { id: true },
    });
    if (!shop) return res.json({ success: true, data: { orders: [] } });

    const orders = await prisma.order.findMany({
      where: {
        items: { some: { shopId: shop.id } },
      },
      include: {
        items: { where: { shopId: shop.id }, include: { book: true } },
        payment: true,
        shipment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: { orders } });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/seller/orders/:id
router.patch("/seller/orders/:id", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status || typeof status !== "string") {
      throw new ApiError("Status is required.", 400);
    }

    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user!.userId },
      select: { id: true },
    });
    if (!shop) throw new ApiError("Order not found.", 404);

    // Update seller's items in order
    await prisma.orderItem.updateMany({
      where: { orderId: req.params.id, shopId: shop.id },
      data: { status },
    });

    // If all items delivered or shipped, update overall order
    const remaining = await prisma.orderItem.count({
      where: { orderId: req.params.id, status: { not: status } },
    });
    if (remaining === 0) {
      await prisma.order.update({
        where: { id: req.params.id },
        data: {
          status,
          paymentStatus: status === "DELIVERED" ? "PAID" : undefined,
        },
      });
    }

    return res.json({ success: true, message: "Order status updated." });
  } catch (error) {
    next(error);
  }
});

// ================= SELLER INVENTORY =================

// GET /api/seller/inventory
router.get("/seller/inventory", async (req, res, next) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user!.userId },
      select: { id: true },
    });
    if (!shop) return res.json({ success: true, data: [] });

    const books = await prisma.book.findMany({
      where: { shopId: shop.id },
      select: {
        id: true,
        title: true,
        stock: true,
        lowStockAlert: true,
        price: true,
      },
      orderBy: { stock: "asc" },
    });

    return res.json({ success: true, data: books });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/seller/inventory
router.patch("/seller/inventory", async (req, res, next) => {
  try {
    const { bookId, stock } = req.body;
    if (!bookId || typeof stock !== "number") {
      throw new ApiError("bookId and numeric stock are required.", 400);
    }

    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user!.userId },
      select: { id: true },
    });
    if (!shop) throw new ApiError("Book not found.", 404);

    await prisma.book.updateMany({
      where: { id: bookId, shopId: shop.id },
      data: { stock: Math.max(0, stock) },
    });

    return res.json({ success: true, message: "Stock updated." });
  } catch (error) {
    next(error);
  }
});

// ================= SELLER COUPONS =================

router.get("/seller/coupons", async (req, res, next) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user!.userId },
      select: { id: true },
    });
    if (!shop) return res.json({ success: true, data: [] });

    const coupons = await prisma.coupon.findMany({
      where: { shopId: shop.id },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
});

router.post("/seller/coupons", async (req, res, next) => {
  try {
    const input = couponSchema.parse(req.body);
    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user!.userId },
      select: { id: true },
    });
    if (!shop) throw new ApiError("Create your shop profile first.", 409);

    const coupon = await prisma.coupon.create({
      data: {
        ...input,
        shopId: shop.id,
      },
    });

    return res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
});

router.delete("/seller/coupons/:id", async (req, res, next) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user!.userId },
      select: { id: true },
    });
    if (!shop) throw new ApiError("Coupon not found.", 404);

    await prisma.coupon.deleteMany({
      where: { id: req.params.id, shopId: shop.id },
    });
    return res.json({ success: true, message: "Coupon deleted." });
  } catch (error) {
    next(error);
  }
});

// ================= SELLER PAYOUTS =================

router.get("/seller/payouts", async (req, res, next) => {
  try {
    const payouts = await prisma.payout.findMany({
      where: { sellerId: req.user!.userId },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: payouts });
  } catch (error) {
    next(error);
  }
});

router.post("/seller/payouts", async (req, res, next) => {
  try {
    const input = payoutRequestSchema.parse(req.body);
    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user!.userId },
      select: { id: true },
    });

    const payout = await prisma.payout.create({
      data: {
        sellerId: req.user!.userId,
        shopId: shop?.id,
        amount: input.amount,
        method: input.method,
        note: input.note,
        status: "PENDING",
      },
    });

    return res.status(201).json({ success: true, data: payout });
  } catch (error) {
    next(error);
  }
});

// ================= SELLER SHOP =================

router.get("/seller/shop", async (req, res, next) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user!.userId },
    });
    return res.json({ success: true, data: shop });
  } catch (error) {
    next(error);
  }
});

router.patch("/seller/shop", async (req, res, next) => {
  try {
    const input = shopSchema.partial().parse(req.body);
    const shop = await prisma.shop.upsert({
      where: { ownerId: req.user!.userId },
      update: input,
      create: {
        ...input,
        ownerId: req.user!.userId,
        name: input.name || "My Book Shop",
        slug: input.slug || `shop-${Date.now().toString(36)}`,
      },
    });
    return res.json({ success: true, data: shop });
  } catch (error) {
    next(error);
  }
});

export default router;
