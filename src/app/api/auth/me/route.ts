import { currentUser, handleError, ok } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return ok({ user: null });

    const shop =
      user.role === "seller"
        ? await prisma.shop.findUnique({
            where: { ownerId: user.id },
            select: { id: true, name: true, slug: true, status: true },
          })
        : null;

    return ok({ user, shop });
  } catch (error) {
    return handleError(error);
  }
}
