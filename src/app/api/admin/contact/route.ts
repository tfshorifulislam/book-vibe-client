import { handleError, ok, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireApiUser("admin");
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return ok({ messages });
  } catch (error) {
    return handleError(error);
  }
}
