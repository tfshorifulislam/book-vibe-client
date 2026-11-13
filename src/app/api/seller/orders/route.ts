import { handleError, ok, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const user = await requireApiUser("seller");
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const orders = await prisma.order.findMany({
      where: {
        items: { some: { sellerId: user.id } },
        ...(status ? { status } : {}),
      },
      include: {
        items: { where: { sellerId: user.id } },
        payment: true,
        shipment: true,
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok({ orders });
  } catch (error) {
    return handleError(error);
  }
}
