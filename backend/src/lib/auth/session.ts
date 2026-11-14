import { generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import type { UserRole } from "@/types";

export const SESSION_COOKIE = "bookhand_session";

export async function createSession(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, name: true },
  });

  if (!user) throw new Error("USER_NOT_FOUND");

  const accessToken = generateAccessToken(user);
  await generateRefreshToken(userId);
  return accessToken;
}

export async function destroySession(userId?: string): Promise<void> {
  if (userId) {
    await prisma.session.deleteMany({ where: { userId } }).catch(() => {});
  }
}

export function dashboardFor(role: UserRole): string {
  if (role === "admin") return "/admin/dashboard";
  if (role === "seller") return "/seller/dashboard";
  return "/buyer/dashboard";
}
