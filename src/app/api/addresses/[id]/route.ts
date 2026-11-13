import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { addressSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const input = addressSchema.parse(await readJson(request));
    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return fail("Address not found.", 404);

    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data: input,
    });
    return ok({ address });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { id } = await params;
    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return fail("Address not found.", 404);
    await prisma.address.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
