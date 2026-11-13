import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";
import { changePasswordSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = changePasswordSchema.parse(await readJson(request));
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });
    if (!dbUser || !(await verifyPassword(input.currentPassword, dbUser.passwordHash))) {
      return fail("Your current password is incorrect.", 400);
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(input.newPassword) },
    });
    return ok({ message: "Password updated successfully." });
  } catch (error) {
    return handleError(error);
  }
}
