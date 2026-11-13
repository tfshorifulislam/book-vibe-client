import { fail, handleError, ok, readJson } from "@/lib/api";
import { prisma } from "@/lib/db";
import { verifyEmailSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const { token } = verifyEmailSchema.parse(await readJson(request));
    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      return fail("This verification link is invalid or has expired.", 400);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      }),
      prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return ok({ message: "Email verified successfully." });
  } catch (error) {
    return handleError(error);
  }
}
