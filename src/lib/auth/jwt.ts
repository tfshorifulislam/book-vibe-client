import { randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";

import { prisma } from "@/lib/db";
import type { UserRole } from "@/types";

export const ACCESS_TOKEN_COOKIE = "bookhand_token";
export const REFRESH_TOKEN_COOKIE = "bookhand_refresh";

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_DAYS = 30;

function getJwtSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "SESSION_SECRET or JWT_SECRET must be configured in production.",
      );
    }
    return "bookhand_dev_jwt_fallback_secret_must_change_in_prod";
  }
  return secret;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  name?: string;
  iat?: number;
  exp?: number;
}

/**
 * Generates a short-lived signed JWT access token.
 */
export function generateAccessToken(user: {
  id: string;
  email: string;
  role: string | UserRole;
  name?: string;
}): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role.toLowerCase() as UserRole,
    name: user.name,
  };

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

/**
 * Generates and persists a refresh token in the database for rotation and revocation.
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  const secret = getJwtSecret();
  const rawId = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 86400000);

  const refreshToken = jwt.sign(
    { userId, tokenId: rawId, type: "refresh" },
    secret,
    { expiresIn: `${REFRESH_TOKEN_DAYS}d` },
  );

  // Store hashed or direct token in Session table for instant revocation
  await prisma.session.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt,
    },
  });

  return refreshToken;
}

/**
 * Verifies a JWT access token synchronously/safely.
 */
export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Validates a refresh token against the database and rotates it.
 */
export async function rotateRefreshToken(oldRefreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; role: UserRole; name: string };
} | null> {
  try {
    const decoded = jwt.verify(oldRefreshToken, getJwtSecret()) as {
      userId: string;
      type?: string;
    };

    if (decoded.type !== "refresh") return null;

    // Verify token exists in database (has not been revoked)
    const session = await prisma.session.findUnique({
      where: { token: oldRefreshToken },
      include: { user: true },
    });

    if (!session || session.expiresAt.getTime() < Date.now()) {
      if (session) {
        await prisma.session
          .delete({ where: { id: session.id } })
          .catch(() => {});
      }
      return null;
    }

    if (session.user.status !== "ACTIVE") return null;

    // Revoke old refresh token
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});

    // Generate new access and refresh tokens
    const newAccessToken = generateAccessToken(session.user);
    const newRefreshToken = await generateRefreshToken(session.user.id);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role.toLowerCase() as UserRole,
        name: session.user.name,
      },
    };
  } catch {
    return null;
  }
}

/**
 * Revokes all refresh tokens for a user or a specific refresh token.
 */
export async function revokeToken(refreshToken: string): Promise<void> {
  await prisma.session
    .deleteMany({
      where: { token: refreshToken },
    })
    .catch(() => {});
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await prisma.session
    .deleteMany({
      where: { userId },
    })
    .catch(() => {});
}
