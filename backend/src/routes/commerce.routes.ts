import { Router } from "express";

import {
  calculateShipping,
  generateOrderNumber,
  getCommerceSettings,
  validateCoupon,
} from "@/lib/commerce";
import { getCartForUser } from "@/lib/data/cart";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/service";
import { orderConfirmationEmailTemplate } from "@/lib/email/templates";
import { initiateBkashPayment } from "@/lib/payments/bkash";
import { initiateStripePayment } from "@/lib/payments/stripe";
import { requireAuth } from "@/middleware/auth";
import { ApiError } from "@/middleware/error";
import {
  addressSchema,
  cartItemSchema,
  cartUpdateSchema,
  checkoutSchema,
  disputeRequestSchema,
  refundRequestSchema,
} from "@/lib/validators";

const router = Router();

// ================= CART =================

// GET /api/cart
router.get("/cart", requireAuth, async (req, res, next) => {
  try {
    const cart = await getCartForUser(req.user!.userId);
    return res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
});

// POST /api/cart
router.post("/cart", requireAuth, async (req, res, next) => {
  try {
    const input = cartItemSchema.parse(req.body);
    const userId = req.user!.userId;
    const book = await prisma.book.findFirst({
      where: { id: input.bookId, isActive: true },
      select: { id: true, stock: true },
    });

    if (!book) throw new ApiError("This book is not available.", 404);
    if (book.stock <= 0) throw new ApiError("This book is out of stock.", 409);

    const cart = await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const existing = await prisma.cartItem.findUnique({
      where: { cartId_bookId: { cartId: cart.id, bookId: book.id } },
    });
    const quantity = Math.min(
      book.stock,
      (existing?.quantity ?? 0) + input.quantity,
    );

    await prisma.cartItem.upsert({
      where: { cartId_bookId: { cartId: cart.id, bookId: book.id } },
      update: { quantity },
      create: { cartId: cart.id, bookId: book.id, quantity },
    });

    return res.json({ success: true, data: await getCartForUser(userId) });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/cart
router.patch("/cart", requireAuth, async (req, res, next) => {
  try {
    const input = cartUpdateSchema.parse(req.body);
    const userId = req.user!.userId;
    const item = await prisma.cartItem.findFirst({
      where: { id: input.itemId, cart: { userId } },
      include: { book: { select: { stock: true } } },
    });

    if (!item) throw new ApiError("Cart item not found.", 404);

    if (input.quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      const quantity = item.book
        ? Math.min(input.quantity, item.book.stock)
        : input.quantity;
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity },
      });
    }

    return res.json({ success: true, data: await getCartForUser(userId) });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/cart
router.delete("/cart", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const itemId = req.query.itemId || req.body.itemId;

    if (typeof itemId === "string") {
      await prisma.cartItem.deleteMany({
        where: { id: itemId, cart: { userId } },
      });
    } else {
      const cart = await prisma.cart.findUnique({ where: { userId } });
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      }
    }

    return res.json({ success: true, data: await getCartForUser(userId) });
  } catch (error) {
    next(error);
  }
});

// ================= COUPONS =================

// POST /api/coupons/validate
router.post("/coupons/validate", async (req, res, next) => {
  try {
    const code = req.body.code;
    const subtotal = Number(req.body.subtotal) || 0;
    if (!code || typeof code !== "string") {
      throw new ApiError("Coupon code is required.", 400);
    }

    const result = await validateCoupon(code, req.user?.userId || "", subtotal);
    if (!result.valid) {
      throw new ApiError(result.message || "Invalid coupon.", 400);
    }

    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// ================= ADDRESSES =================

// GET /api/addresses
router.get("/addresses", requireAuth, async (req, res, next) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return res.json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
});

// POST /api/addresses
router.post("/addresses", requireAuth, async (req, res, next) => {
  try {
    const input = addressSchema.parse(req.body);
    const userId = req.user!.userId;

    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: { ...input, userId },
    });

    return res.status(201).json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/addresses/:id
router.patch("/addresses/:id", requireAuth, async (req, res, next) => {
  try {
    const input = addressSchema.partial().parse(req.body);
    const userId = req.user!.userId;
    const addressId = req.params.id as string;

    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.updateMany({
      where: { id: addressId, userId },
      data: input,
    });

    if (updated.count === 0) throw new ApiError("Address not found.", 404);

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });
    return res.json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/addresses/:id
router.delete("/addresses/:id", requireAuth, async (req, res, next) => {
  try {
    await prisma.address.deleteMany({
      where: { id: req.params.id as string, userId: req.user!.userId },
    });
    return res.json({ success: true, message: "Address deleted." });
  } catch (error) {
    next(error);
  }
});

// ================= ORDERS =================

// GET /api/orders
router.get("/orders", requireAuth, async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.userId },
      include: {
        items: true,
        payment: true,
        shipment: true,
        refunds: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: { orders } });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id
router.get("/orders/:id", requireAuth, async (req, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id as string, userId: req.user!.userId },
      include: {
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

// PATCH /api/orders/:id (Buyer cancellation & status updates)
router.patch("/orders/:id", requireAuth, async (req, res, next) => {
  try {
    const orderId = req.params.id as string;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payment: true,
        shipment: true,
      },
    });

    if (!order) throw new ApiError("Order not found.", 404);

    // Verify ownership (only buyer who placed it or admin can cancel via this route)
    if (order.userId !== userId && userRole !== "admin") {
      throw new ApiError(
        "You do not have permission to modify this order.",
        403,
      );
    }

    const { status, note } = req.body;

    if (status === "CANCELLED") {
      // Validate cancellable status
      if (order.status !== "PENDING" && order.status !== "CONFIRMED") {
        throw new ApiError(
          `Order cannot be cancelled because it is already ${order.status.toLowerCase()}. You may request a return once delivered.`,
          400,
        );
      }

      const updated = await prisma.$transaction(async (tx) => {
        // Return stock and adjust sales count
        for (const item of order.items) {
          if (item.bookId) {
            await tx.book.update({
              where: { id: item.bookId },
              data: {
                stock: { increment: item.quantity },
                salesCount: { decrement: item.quantity },
              },
            });

            await tx.inventoryMovement.create({
              data: {
                bookId: item.bookId,
                type: "RESTOCK",
                quantity: item.quantity,
                note: `Order ${order.orderNumber} cancelled by buyer`,
              },
            });
          }
        }

        // Update payment & shipment
        if (order.payment) {
          await tx.payment.update({
            where: { id: order.payment.id },
            data: { status: "CANCELLED" },
          });
        }

        if (order.shipment) {
          await tx.shipment.update({
            where: { id: order.shipment.id },
            data: { status: "CANCELLED" },
          });
        }

        // Update order items
        await tx.orderItem.updateMany({
          where: { orderId: order.id },
          data: { status: "CANCELLED" },
        });

        // Update order
        return tx.order.update({
          where: { id: order.id },
          data: {
            status: "CANCELLED",
            paymentStatus:
              order.paymentStatus === "PAID" ? "REFUNDED" : "CANCELLED",
            notes: note || "Cancelled by buyer",
          },
          include: { items: true, payment: true, shipment: true },
        });
      });

      return res.json({
        success: true,
        message: "Order has been cancelled and inventory restocked.",
        data: updated,
      });
    }

    throw new ApiError(
      "Invalid status transition for buyer order update.",
      400,
    );
  } catch (error) {
    next(error);
  }
});

// POST /api/orders
router.post("/orders", requireAuth, async (req, res, next) => {
  try {
    const user = req.user!;
    const input = checkoutSchema.parse(req.body);

    const cart = await prisma.cart.findUnique({
      where: { userId: user.userId },
      include: {
        items: {
          include: {
            book: {
              include: {
                shop: { select: { ownerId: true } },
                author: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new ApiError("Your cart is empty.", 409);
    }

    let address;
    if (input.addressId) {
      address = await prisma.address.findFirst({
        where: { id: input.addressId, userId: user.userId },
      });
      if (!address) throw new ApiError("Delivery address not found.", 404);
    } else if (input.address) {
      address = await prisma.address.create({
        data: { ...input.address, userId: user.userId },
      });
    } else {
      address = await prisma.address.findFirst({
        where: { userId: user.userId, isDefault: true },
      });
      if (!address) {
        throw new ApiError("Please provide a delivery address.", 400);
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.quantity * (item.book?.price ?? 0),
      0,
    );

    let discount = 0;
    let couponId: string | undefined;
    if (input.couponCode) {
      const couponResult = await validateCoupon(
        input.couponCode,
        req.user!.userId,
        subtotal,
      );
      if (couponResult.valid) {
        discount = couponResult.discount;
        couponId = couponResult.coupon?.id;
      }
    }

    const settings = await getCommerceSettings();
    const shipping = calculateShipping(subtotal, settings);
    const total = Math.max(0, subtotal - discount) + shipping;
    const orderNumber = generateOrderNumber();

    const addressSnapshot = JSON.stringify({
      recipientName: address.recipientName,
      phone: address.phone,
      district: address.district,
      city: address.city,
      area: address.area,
      postalCode: address.postalCode,
      instructions: address.instructions,
    });

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: user.userId,
          status: "PENDING",
          subtotal,
          discount,
          shipping,
          total,
          couponId,
          paymentMethod: input.paymentMethod,
          paymentStatus: "PENDING",
          addressSnapshot,
          notes: input.notes,
          items: {
            create: cart.items.map((item) => ({
              bookId: item.bookId,
              sellerId: item.book?.shop?.ownerId,
              shopId: item.book?.shopId,
              title: item.book?.title ?? "Book",
              author: item.book?.author?.name ?? "Unknown",
              coverTone: item.book?.coverTone,
              price: item.book?.price ?? 0,
              quantity: item.quantity,
              status: "PENDING",
            })),
          },
          payment: {
            create: {
              provider: input.paymentMethod,
              amount: total,
              status: "PENDING",
            },
          },
          shipment: {
            create: {
              status: "PROCESSING",
              estimatedDelivery: new Date(Date.now() + 3 * 86400 * 1000),
            },
          },
        },
        include: { items: true, payment: true },
      });

      for (const item of cart.items) {
        await tx.book.update({
          where: { id: item.bookId },
          data: {
            stock: { decrement: item.quantity },
            salesCount: { increment: item.quantity },
          },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return created;
    });

    // Handle online payments
    let paymentUrl: string | undefined;
    const paymentPayload = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
      customerName: address.recipientName,
      customerEmail: user.email,
      customerPhone: address.phone,
    };

    if (input.paymentMethod === "BKASH") {
      const res = await initiateBkashPayment(paymentPayload);
      if (res.success && res.paymentUrl) paymentUrl = res.paymentUrl;
    } else if (input.paymentMethod === "CARD") {
      const res = await initiateStripePayment(paymentPayload);
      if (res.success && res.paymentUrl) paymentUrl = res.paymentUrl;
    }

    // Send confirmation email
    const emailData = orderConfirmationEmailTemplate({
      orderNumber: order.orderNumber,
      customerName: address.recipientName,
      total: order.total,
      items: order.items.map((i) => ({
        title: i.title,
        quantity: i.quantity,
        price: i.price,
      })),
    });
    await sendEmail({
      to: user.email,
      subject: emailData.subject,
      html: emailData.html,
    }).catch(console.error);

    return res.status(201).json({
      success: true,
      data: { order, paymentUrl },
    });
  } catch (error) {
    next(error);
  }
});

// ================= REFUNDS & DISPUTES =================

// POST /api/refunds
router.post("/refunds", requireAuth, async (req, res, next) => {
  try {
    const input = refundRequestSchema.parse(req.body);
    const userId = req.user!.userId;

    const order = await prisma.order.findFirst({
      where: { id: input.orderId, userId },
      include: { refunds: true },
    });

    if (!order) throw new ApiError("Order not found or unauthorized.", 404);
    if (order.status !== "DELIVERED") {
      throw new ApiError(
        "Refunds can only be requested for delivered orders.",
        400,
      );
    }

    const activeRefund = order.refunds.find(
      (r) =>
        r.status === "REQUESTED" ||
        r.status === "APPROVED" ||
        r.status === "PROCESSED",
    );
    if (activeRefund) {
      throw new ApiError(
        `A refund request is already ${activeRefund.status.toLowerCase()} for this order.`,
        409,
      );
    }

    const refundAmount =
      input.amount && input.amount <= order.total ? input.amount : order.total;

    const refund = await prisma.refund.create({
      data: {
        orderId: order.id,
        amount: refundAmount,
        reason: input.reason,
        note: input.note,
        status: "REQUESTED",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Refund request submitted successfully.",
      data: refund,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/disputes
router.post("/disputes", requireAuth, async (req, res, next) => {
  try {
    const input = disputeRequestSchema.parse(req.body);
    const userId = req.user!.userId;

    const order = await prisma.order.findFirst({
      where: { id: input.orderId, userId },
      include: { disputes: true },
    });

    if (!order) throw new ApiError("Order not found or unauthorized.", 404);

    const openDispute = order.disputes.find((d) => d.status === "OPEN");
    if (openDispute) {
      throw new ApiError("An open dispute already exists for this order.", 409);
    }

    const dispute = await prisma.dispute.create({
      data: {
        orderId: order.id,
        userId,
        reason: input.reason,
        status: "OPEN",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Dispute opened successfully.",
      data: dispute,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
