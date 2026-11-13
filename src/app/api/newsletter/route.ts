import { handleError, ok, readJson } from "@/lib/api";
import { prisma } from "@/lib/db";
import { newsletterSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const { email } = newsletterSchema.parse(await readJson(request));
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email },
    });
    if (existing) {
      return ok({
        status: "duplicate",
        message: "This email is already subscribed to the BookHand newsletter.",
      });
    }
    await prisma.newsletterSubscription.create({ data: { email } });
    return ok({
      status: "success",
      message:
        "You are subscribed. Look out for new arrivals, offers, and reading picks.",
    });
  } catch (error) {
    return handleError(error);
  }
}
