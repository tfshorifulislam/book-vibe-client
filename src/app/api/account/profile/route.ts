import { handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { profileSchema } from "@/lib/validators";

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser();
    const input = profileSchema.parse(await readJson(request));
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: input,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        bio: true,
        role: true,
      },
    });
    return ok({ user: updated });
  } catch (error) {
    return handleError(error);
  }
}
