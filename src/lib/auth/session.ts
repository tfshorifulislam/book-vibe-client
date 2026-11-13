import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import type { User, UserRole } from "@/types";

export const SESSION_COOKIE = "bookhand_session";
const SESSION_DAYS = 30;

function signSessionToken(token: string): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return token;
  const signature = createHmac("sha256", secret).update(token).digest("hex");
  return `${token}.${signature}`;
}

function verifyAndExtractToken(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return cookieValue;

  const dotIdx = cookieValue.lastIndexOf(".");
  if (dotIdx === -1) {
    // Backward compatibility: allow legacy unsigned tokens
    return cookieValue;
  }

  const token = cookieValue.slice(0, dotIdx);
  const signature = cookieValue.slice(dotIdx + 1);
  const expectedSignature = createHmac("sha256", secret)
    .update(token)
    .digest("hex");

  try {
    const sigBuf = Buffer.from(signature, "hex");
    const expectedBuf = Buffer.from(expectedSignature, "hex");
    if (
      sigBuf.length === expectedBuf.length &&
      timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return token;
    }
  } catch {
    return null;
  }

  return null;
}

type DbUser = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  status: string;
};

function toUser(user: DbUser): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar ?? undefined,
    role: user.role.toLowerCase() as UserRole,
  };
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400000);

  await prisma.session.deleteMany({
    where: { userId, expiresAt: { lt: new Date() } },
  });

  await prisma.session.create({ data: { token, userId, expiresAt } });

  const signedCookieValue = signSessionToken(token);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, signedCookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get(SESSION_COOKIE)?.value;
  const token = verifyAndExtractToken(rawCookie);

  if (token) {
    await prisma.session.deleteMany({ where: { token } });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const rawCookie = cookieStore.get(SESSION_COOKIE)?.value;
  const token = verifyAndExtractToken(rawCookie);
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          status: true,
        },
      },
    },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  if (session.user.status !== "ACTIVE") return null;

  return toUser(session.user);
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: UserRole): Promise<User> {
  const user = await requireUser();
  if (user.role !== role) {
    const destination =
      user.role === "admin"
        ? "/admin/dashboard"
        : user.role === "seller"
          ? "/seller/dashboard"
          : "/buyer/dashboard";
    redirect(destination);
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  return requireRole("admin");
}

export async function requireSeller(): Promise<User> {
  return requireRole("seller");
}

export async function requireBuyer(): Promise<User> {
  return requireRole("buyer");
}

export function dashboardFor(role: UserRole): string {
  if (role === "admin") return "/admin/dashboard";
  if (role === "seller") return "/seller/dashboard";
  return "/buyer/dashboard";
}
