import { handleError, ok, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    await requireApiUser("admin");
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const orders = await prisma.order.findMany({
      where: status ? { status } : {},
      include: {
        items: true,
        payment: true,
        shipment: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    return ok({ orders });
  } catch (error) {
    return handleError(error);
  }
}
