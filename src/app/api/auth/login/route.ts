import { fail, handleError, ok, readJson } from "@/lib/api";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, dashboardFor } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import type { UserRole } from "@/types";

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await readJson(request));
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        status: true,
        passwordHash: true,
      },
    });

    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      return fail("Invalid email or password.", 401);
    }
    if (user.status !== "ACTIVE") {
      return fail("This account has been suspended. Contact support.", 403);
    }

    await createSession(user.id);
    const role = user.role.toLowerCase() as UserRole;

    return ok({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role,
      },
      redirectTo: dashboardFor(role),
    });
  } catch (error) {
    return handleError(error);
  }
}
