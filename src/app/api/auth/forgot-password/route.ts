import { randomBytes } from "node:crypto";

import { handleError, ok, readJson } from "@/lib/api";
import { prisma } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const { email } = forgotPasswordSchema.parse(await readJson(request));
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    let resetUrl: string | undefined;
    if (user) {
      const token = randomBytes(32).toString("hex");
      await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      resetUrl =
        process.env.NODE_ENV === "development"
          ? `/reset-password?token=${token}`
          : undefined;
      console.info(
        `[BookHand] Password reset requested for ${email}.${
          resetUrl ? ` Development link: ${resetUrl}` : ""
        }`,
      );
    }

    return ok({
      message:
        "If an account exists for that email, a password reset link has been sent.",
      resetUrl,
    });
  } catch (error) {
    return handleError(error);
  }
}
