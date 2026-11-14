import type { NextFunction, Request, Response } from "express";

import {
  ACCESS_TOKEN_COOKIE,
  type JwtPayload,
  REFRESH_TOKEN_COOKIE,
  rotateRefreshToken,
  verifyAccessToken,
} from "@/lib/auth/jwt";
import type { UserRole } from "@/types";

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export async function authenticateJwt(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    let token: string | undefined;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7).trim();
    }

    // 2. Check HTTP-only cookie
    if (!token && req.cookies) {
      token = req.cookies[ACCESS_TOKEN_COOKIE];
    }

    // If access token exists, verify it
    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.user = decoded;
        return next();
      }
    }

    // 3. If access token is expired or missing, check refresh token cookie
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (refreshToken) {
      const rotated = await rotateRefreshToken(refreshToken);
      if (rotated) {
        const isProduction = process.env.NODE_ENV === "production";
        res.cookie(ACCESS_TOKEN_COOKIE, rotated.accessToken, {
          httpOnly: true,
          sameSite: "lax",
          secure: isProduction,
          path: "/",
          maxAge: 15 * 60 * 1000,
        });

        res.cookie(REFRESH_TOKEN_COOKIE, rotated.refreshToken, {
          httpOnly: true,
          sameSite: "lax",
          secure: isProduction,
          path: "/",
          maxAge: 30 * 86400 * 1000,
        });

        req.user = {
          userId: rotated.user.id,
          email: rotated.user.email,
          role: rotated.user.role,
          name: rotated.user.name,
        };
        return next();
      }
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }
  return next();
}

export function requireRole(role: UserRole | UserRole[]) {
  const allowed = Array.isArray(role) ? role : [role];
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }
    return next();
  };
}
