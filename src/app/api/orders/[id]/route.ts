import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { updateOrderStatus } from "@/lib/orders";
import { orderStatusSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const order = await prisma.order.findFirst({
      where:
        user.role === "admin"
          ? { id }
          : user.role === "seller"
            ? { id, items: { some: { sellerId: user.id } } }
            : { id, userId: user.id },
      include: {
        items: true,
        payment: true,
        shipment: true,
        refunds: true,
        disputes: true,
      },
    });
    if (!order) return fail("Order not found.", 404);
    return ok({ order });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const input = orderStatusSchema.parse(await readJson(request));

    if (user.role !== "buyer" && user.role !== "seller" && user.role !== "admin") {
      return fail("Forbidden.", 403);
    }

    const order = await updateOrderStatus({
      orderId: id,
      status: input.status,
      actorId: user.id,
      actorRole: user.role,
      note: input.note,
      trackingNumber: input.trackingNumber,
      carrier: input.carrier,
    });

    return ok({ order });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") return fail("Order not found.", 404);
      if (error.message === "INVALID_TRANSITION") {
        return fail("That status change is not allowed.", 409);
      }
    }
    return handleError(error);
  }
}
