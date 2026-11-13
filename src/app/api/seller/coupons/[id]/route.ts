import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { couponSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireApiUser("seller");
    const { id } = await params;
    const existing = await prisma.coupon.findFirst({
      where: { id, shop: { ownerId: user.id } },
    });
    if (!existing) return fail("Coupon not found.", 404);
    const input = couponSchema.parse(await readJson(request));
    const coupon = await prisma.coupon.update({
      where: { id },
      data: input,
    });
    return ok({ coupon });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireApiUser("seller");
    const { id } = await params;
    const existing = await prisma.coupon.findFirst({
      where: { id, shop: { ownerId: user.id } },
    });
    if (!existing) return fail("Coupon not found.", 404);
    await prisma.coupon.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
