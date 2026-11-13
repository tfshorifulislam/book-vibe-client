import { handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { addressSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireApiUser();
    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    return ok({ addresses });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = addressSchema.parse(await readJson(request));
    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }
    const address = await prisma.address.create({
      data: { ...input, userId: user.id },
    });
    return ok({ address }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
