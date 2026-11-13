import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { sendEmail } from "@/lib/email/service";
import { orderConfirmationEmailTemplate } from "@/lib/email/templates";
import { initiateBkashPayment } from "@/lib/payments/bkash";
import { initiateStripePayment } from "@/lib/payments/stripe";
import {
  calculateShipping,
  generateOrderNumber,
  getCommerceSettings,
  validateCoupon,
} from "@/lib/commerce";
import { prisma } from "@/lib/db";
import { checkoutSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireApiUser();
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: true,
        payment: true,
        shipment: true,
        refunds: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return ok({ orders });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = checkoutSchema.parse(await readJson(request));
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
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
      return fail("Your cart is empty.", 409);
    }

    let address;
    if (input.addressId) {
      address = await prisma.address.findFirst({
        where: { id: input.addressId, userId: user.id },
      });
      if (!address) return fail("Delivery address not found.", 404);
    } else if (input.address) {
      address = await prisma.address.create({
        data: { ...input.address, userId: user.id },
      });
    } else {
      address = await prisma.address.findFirst({
        where: { userId: user.id, isDefault: true },
      });
      if (!address) {
        address = await prisma.address.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "asc" },
        });
      }
      if (!address) return fail("Add a delivery address before checkout.", 422);
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.book.price * item.quantity,
      0,
    );
    const settings = await getCommerceSettings();
    let discount = 0;
    let freeShipping = false;
    let couponId: string | null = null;

    if (input.couponCode) {
      const coupon = await validateCoupon(input.couponCode, user.id, subtotal);
      if (!coupon.valid || !coupon.coupon) {
        return fail(coupon.message, 422);
      }
      discount = coupon.discount;
      freeShipping = coupon.freeShipping;
      couponId = coupon.coupon.id;
    }

    let shipping = calculateShipping(subtotal, settings);
    if (freeShipping) shipping = 0;
    const total = Math.max(0, subtotal - discount + shipping);
    const orderNumber = generateOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        const updated = await tx.book.updateMany({
          where: { id: item.bookId, stock: { gte: item.quantity } },
          data: {
            stock: { decrement: item.quantity },
            salesCount: { increment: item.quantity },
          },
        });
        if (updated.count === 0) {
          throw new Error(`INSUFFICIENT_STOCK:${item.book.title}`);
        }
      }

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          status: "PENDING",
          subtotal,
          discount,
          shipping,
          total,
          couponId,
          paymentMethod: input.paymentMethod,
          paymentStatus: "PENDING",
          addressSnapshot: JSON.stringify({
            recipientName: address.recipientName,
            phone: address.phone,
            district: address.district,
            city: address.city,
            area: address.area,
            postalCode: address.postalCode,
            instructions: address.instructions,
          }),
          notes: input.notes,
          items: {
            create: cart.items.map((item) => ({
              bookId: item.bookId,
              sellerId: item.book.shop.ownerId,
              shopId: item.book.shopId,
              title: item.book.title,
              author: item.book.author.name,
              coverTone: item.book.coverTone,
              price: item.book.price,
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
            create: { status: "PROCESSING" },
          },
        },
        include: { items: true, payment: true, shipment: true },
      });

      for (const item of cart.items) {
        await tx.inventoryMovement.create({
          data: {
            bookId: item.bookId,
            type: "SALE",
            quantity: -item.quantity,
            note: `Order ${orderNumber}`,
          },
        });
      }

      if (couponId) {
        await tx.couponUsage.create({
          data: { couponId, userId: user.id, orderId: created.id },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      await tx.notification.create({
        data: {
          userId: user.id,
          type: "ORDER",
          title: "Order placed",
          message: `Your order ${orderNumber} has been placed successfully.`,
          href: `/buyer/orders/${created.id}`,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "ORDER_CREATED",
          entity: "Order",
          entityId: created.id,
          metadata: JSON.stringify({
            total,
            paymentMethod: input.paymentMethod,
          }),
        },
      });

      return created;
    });

    const emailData = orderConfirmationEmailTemplate({
      orderNumber: order.orderNumber,
      customerName: user.name,
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
    });

    let paymentUrl: string | undefined;
    if (input.paymentMethod === "BKASH") {
      const p = await initiateBkashPayment({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.total,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: address.phone,
      });
      if (p.success && p.paymentUrl) paymentUrl = p.paymentUrl;
    } else if (
      input.paymentMethod === "CARD" &&
      process.env.STRIPE_SECRET_KEY
    ) {
      const p = await initiateStripePayment({
        orderId: order.id,
        orderNumber: order.orderNumber,
        amount: order.total,
        customerName: user.name,
        customerEmail: user.email,
      });
      if (p.success && p.paymentUrl) paymentUrl = p.paymentUrl;
    }

    return ok({ order, paymentUrl }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("INSUFFICIENT_STOCK:")
    ) {
      return fail(
        `${error.message.split(":")[1]} no longer has enough stock.`,
        409,
      );
    }
    return handleError(error);
  }
}
