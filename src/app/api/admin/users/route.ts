import { handleError, ok, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    await requireApiUser("admin");
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const role = searchParams.get("role");
    const users = await prisma.user.findMany({
      where: {
        ...(q
          ? {
              OR: [
                { name: { contains: q } },
                { email: { contains: q } },
              ],
            }
          : {}),
        ...(role ? { role } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        _count: { select: { orders: true, reviews: true } },
        shop: { select: { name: true, slug: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return ok({ users });
  } catch (error) {
    return handleError(error);
  }
}
