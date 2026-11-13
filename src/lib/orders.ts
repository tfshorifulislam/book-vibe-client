import "server-only";

import { prisma } from "@/lib/db";
import type { UserRole } from "@/types";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export type UpdateOrderInput = {
  orderId: string;
  status: string;
  actorId: string;
  actorRole: UserRole;
  note?: string;
  trackingNumber?: string;
  carrier?: string;
};

export async function updateOrderStatus(input: UpdateOrderInput) {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: { items: true, shipment: true },
  });
  if (!order) throw new Error("NOT_FOUND");

  if (input.actorRole === "buyer") {
    if (order.userId !== input.actorId) throw new Error("FORBIDDEN");
    if (input.status !== "CANCELLED") throw new Error("FORBIDDEN");
  }
  if (input.actorRole === "seller") {
    const ownsItem = order.items.some(
      (item) => item.sellerId === input.actorId,
    );
    if (!ownsItem) throw new Error("FORBIDDEN");
  }
  if (input.actorRole !== "admin") {
    const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(input.status)) {
      throw new Error("INVALID_TRANSITION");
    }
  }

  const isCancelling =
    (input.status === "CANCELLED" || input.status === "REFUNDED") &&
    order.status !== "CANCELLED" &&
    order.status !== "REFUNDED";

  return prisma.$transaction(async (tx) => {
    if (isCancelling) {
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
              type: input.status === "REFUNDED" ? "REFUND" : "CANCELLATION",
              quantity: item.quantity,
              note: `Order ${order.orderNumber}: ${input.note ?? input.status}`,
            },
          });
        }
      }
    }

    const updated = await tx.order.update({
      where: { id: order.id },
      data: {
        status: input.status,
        paymentStatus:
          input.status === "REFUNDED"
            ? "REFUNDED"
            : input.status === "DELIVERED"
              ? order.paymentMethod === "COD"
                ? "PAID"
                : order.paymentStatus
              : order.paymentStatus,
        items: {
          updateMany: {
            where: { orderId: order.id },
            data: { status: input.status },
          },
        },
        shipment: order.shipment
          ? {
              update: {
                status:
                  input.status === "DELIVERED"
                    ? "DELIVERED"
                    : input.status === "SHIPPED"
                      ? "SHIPPED"
                      : input.status === "CANCELLED"
                        ? "CANCELLED"
                        : undefined,
                trackingNumber: input.trackingNumber,
                carrier: input.carrier,
                deliveredAt:
                  input.status === "DELIVERED" ? new Date() : undefined,
              },
            }
          : {
              create: {
                status: input.status === "DELIVERED" ? "DELIVERED" : "PROCESSING",
                trackingNumber: input.trackingNumber,
                carrier: input.carrier,
              },
            },
      },
      include: { items: true, payment: true, shipment: true },
    });

    await tx.notification.create({
      data: {
        userId: order.userId,
        type: "ORDER",
        title: `Order ${input.status.toLowerCase()}`,
        message: `Order ${order.orderNumber} is now ${input.status.toLowerCase().replaceAll("_", " ")}.${input.note ? ` ${input.note}` : ""}`,
        href: `/buyer/orders/${order.id}`,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: input.actorId,
        action: "ORDER_STATUS_UPDATED",
        entity: "Order",
        entityId: order.id,
        metadata: JSON.stringify({
          from: order.status,
          to: input.status,
          note: input.note,
        }),
      },
    });

    return updated;
  });
}
