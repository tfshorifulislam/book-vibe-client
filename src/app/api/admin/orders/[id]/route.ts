import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { updateOrderStatus } from "@/lib/orders";
import { orderStatusSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await requireApiUser("admin");
    const { id } = await params;
    const input = orderStatusSchema.parse(await readJson(request));
    const order = await updateOrderStatus({
      orderId: id,
      status: input.status,
      actorId: admin.id,
      actorRole: "admin",
      note: input.note,
      trackingNumber: input.trackingNumber,
      carrier: input.carrier,
    });
    return ok({ order });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return fail("Order not found.", 404);
    }
    return handleError(error);
  }
}
