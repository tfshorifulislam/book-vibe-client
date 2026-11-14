import { Router } from "express";

import { prisma } from "@/lib/db";
import { requireAuth, requireRole } from "@/middleware/auth";
import { ApiError } from "@/middleware/error";

const router = Router();

// Strictly require Admin role for all admin routes
router.use("/admin", requireAuth, requireRole("admin"));

// ================= ADMIN BOOKS =================

router.get("/admin/books", async (req, res, next) => {
  try {
    const books = await prisma.book.findMany({
      include: {
        shop: { select: { name: true } },
        category: { select: { name: true } },
        author: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: { books } });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/books/:id", async (req, res, next) => {
  try {
    const updated = await prisma.book.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

router.delete("/admin/books/:id", async (req, res, next) => {
  try {
    await prisma.book.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: "Book deleted." });
  } catch (error) {
    next(error);
  }
});

// ================= ADMIN ORDERS =================

router.get("/admin/orders", async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: true,
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

router.get("/admin/orders/:id", async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        user: true,
        items: { include: { book: true } },
        payment: true,
        shipment: true,
        refunds: true,
        disputes: true,
      },
    });
    if (!order) throw new ApiError("Order not found.", 404);
    return res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/orders/:id", async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        status,
        paymentStatus,
        payment: paymentStatus
          ? { update: { status: paymentStatus } }
          : undefined,
      },
    });
    return res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// ================= ADMIN USERS =================

router.get("/admin/users", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        shop: { select: { id: true, name: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: { users } });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/users/:id", async (req, res, next) => {
  try {
    const { role, status } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        role: role ? role.toUpperCase() : undefined,
        status,
      },
    });
    return res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// ================= ADMIN CATEGORIES =================

router.get("/admin/categories", async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: { parent: true, _count: { select: { books: true } } },
      orderBy: { order: "asc" },
    });
    return res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/categories", async (req, res, next) => {
  try {
    const category = await prisma.category.create({ data: req.body });
    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/categories/:id", async (req, res, next) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
});

router.delete("/admin/categories/:id", async (req, res, next) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: "Category deleted." });
  } catch (error) {
    next(error);
  }
});

// ================= ADMIN AUTHORS & PUBLISHERS =================

router.get("/admin/authors", async (req, res, next) => {
  try {
    const authors = await prisma.author.findMany({
      include: { _count: { select: { books: true } } },
      orderBy: { name: "asc" },
    });
    return res.json({ success: true, data: authors });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/authors", async (req, res, next) => {
  try {
    const author = await prisma.author.create({ data: req.body });
    return res.status(201).json({ success: true, data: author });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/authors/:id", async (req, res, next) => {
  try {
    const author = await prisma.author.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return res.json({ success: true, data: author });
  } catch (error) {
    next(error);
  }
});

router.delete("/admin/authors/:id", async (req, res, next) => {
  try {
    await prisma.author.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: "Author deleted." });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/publishers", async (req, res, next) => {
  try {
    const publishers = await prisma.publisher.findMany({
      include: { _count: { select: { books: true } } },
      orderBy: { name: "asc" },
    });
    return res.json({ success: true, data: publishers });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/publishers", async (req, res, next) => {
  try {
    const publisher = await prisma.publisher.create({ data: req.body });
    return res.status(201).json({ success: true, data: publisher });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/publishers/:id", async (req, res, next) => {
  try {
    const publisher = await prisma.publisher.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return res.json({ success: true, data: publisher });
  } catch (error) {
    next(error);
  }
});

router.delete("/admin/publishers/:id", async (req, res, next) => {
  try {
    await prisma.publisher.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: "Publisher deleted." });
  } catch (error) {
    next(error);
  }
});

// ================= ADMIN COUPONS =================

router.get("/admin/coupons", async (req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: coupons });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/coupons", async (req, res, next) => {
  try {
    const coupon = await prisma.coupon.create({ data: req.body });
    return res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/coupons/:id", async (req, res, next) => {
  try {
    const coupon = await prisma.coupon.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return res.json({ success: true, data: coupon });
  } catch (error) {
    next(error);
  }
});

router.delete("/admin/coupons/:id", async (req, res, next) => {
  try {
    await prisma.coupon.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: "Coupon deleted." });
  } catch (error) {
    next(error);
  }
});

// ================= ADMIN CONTACT MESSAGES =================

router.get("/admin/contact", async (req, res, next) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/contact/:id", async (req, res, next) => {
  try {
    const { status } = req.body;
    const msg = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { status },
    });
    return res.json({ success: true, data: msg });
  } catch (error) {
    next(error);
  }
});

router.delete("/admin/contact/:id", async (req, res, next) => {
  try {
    await prisma.contactMessage.delete({ where: { id: req.params.id } });
    return res.json({ success: true, message: "Message deleted." });
  } catch (error) {
    next(error);
  }
});

// ================= ADMIN REFUNDS & PAYOUTS =================

router.get("/admin/refunds", async (req, res, next) => {
  try {
    const refunds = await prisma.refund.findMany({
      include: {
        order: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: refunds });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/refunds", async (req, res, next) => {
  try {
    const { id, status, note } = req.body;
    const refund = await prisma.refund.update({
      where: { id },
      data: { status, note },
    });
    return res.json({ success: true, data: refund });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/payouts", async (req, res, next) => {
  try {
    const payouts = await prisma.payout.findMany({
      include: {
        seller: { select: { name: true, email: true } },
        shop: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: payouts });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/payouts", async (req, res, next) => {
  try {
    const { id, status, note } = req.body;
    const payout = await prisma.payout.update({
      where: { id },
      data: {
        status,
        note,
        processedAt: status === "COMPLETED" ? new Date() : undefined,
      },
    });
    return res.json({ success: true, data: payout });
  } catch (error) {
    next(error);
  }
});

// ================= ADMIN SETTINGS & BANNERS & FAQS =================

router.get("/admin/banners", async (req, res, next) => {
  try {
    const banners = await prisma.banner.findMany({ orderBy: { order: "asc" } });
    return res.json({ success: true, data: banners });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/banners", async (req, res, next) => {
  try {
    const banner = await prisma.banner.create({ data: req.body });
    return res.status(201).json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/faqs", async (req, res, next) => {
  try {
    const faqs = await prisma.faq.findMany({ orderBy: { order: "asc" } });
    return res.json({ success: true, data: faqs });
  } catch (error) {
    next(error);
  }
});

router.post("/admin/faqs", async (req, res, next) => {
  try {
    const faq = await prisma.faq.create({ data: req.body });
    return res.status(201).json({ success: true, data: faq });
  } catch (error) {
    next(error);
  }
});

router.get("/admin/settings", async (req, res, next) => {
  try {
    const settings = await prisma.siteSetting.findMany();
    const map: Record<string, unknown> = {};
    for (const s of settings) {
      try {
        map[s.key] = JSON.parse(s.value);
      } catch {
        map[s.key] = s.value;
      }
    }
    return res.json({ success: true, data: map });
  } catch (error) {
    next(error);
  }
});

router.patch("/admin/settings", async (req, res, next) => {
  try {
    const updates = req.body as Record<string, unknown>;
    for (const [key, value] of Object.entries(updates)) {
      const valStr = typeof value === "string" ? value : JSON.stringify(value);
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value: valStr },
        create: { key, value: valStr },
      });
    }
    return res.json({ success: true, message: "Settings updated." });
  } catch (error) {
    next(error);
  }
});

export default router;
