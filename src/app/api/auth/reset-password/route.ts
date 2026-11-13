import { fail, handleError, ok, readJson } from "@/lib/api";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const input = resetPasswordSchema.parse(await readJson(request));
    const record = await prisma.passwordResetToken.findUnique({
      where: { token: input.token },
      include: { user: { select: { id: true } } },
    });

    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      return fail("This reset link is invalid or has expired.", 400);
    }

    const passwordHash = await hashPassword(input.password);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      prisma.session.deleteMany({ where: { userId: record.userId } }),
    ]);

    return ok({ message: "Password updated. You can now sign in." });
  } catch (error) {
    return handleError(error);
  }
}
