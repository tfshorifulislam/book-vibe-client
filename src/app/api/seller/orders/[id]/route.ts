import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { updateOrderStatus } from "@/lib/orders";
import { orderStatusSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireApiUser("seller");
    const { id } = await params;
    const input = orderStatusSchema.parse(await readJson(request));
    const order = await updateOrderStatus({
      orderId: id,
      status: input.status,
      actorId: user.id,
      actorRole: "seller",
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
