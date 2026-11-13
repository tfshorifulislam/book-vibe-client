import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { adminUserSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await requireApiUser("admin");
    const { id } = await params;
    const input = adminUserSchema.parse(await readJson(request));
    if (id === admin.id && input.status === "SUSPENDED") {
      return fail("You cannot suspend your own account.", 409);
    }
    const user = await prisma.user.update({
      where: { id },
      data: input,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
      },
    });
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "USER_UPDATED",
        entity: "User",
        entityId: id,
        metadata: JSON.stringify(input),
      },
    });
    return ok({ user });
  } catch (error) {
    return handleError(error);
  }
}
