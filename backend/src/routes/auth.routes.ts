import { Router } from "express";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  ACCESS_TOKEN_COOKIE,
  generateAccessToken,
  generateRefreshToken,
  REFRESH_TOKEN_COOKIE,
  revokeToken,
} from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/service";
import {
  emailVerificationEmail,
  passwordResetEmail,
} from "@/lib/email/templates";
import { ApiError } from "@/middleware/error";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validators";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });

    if (existing) {
      throw new ApiError("An account with this email already exists.", 409);
    }

    const passwordHash = await hashPassword(input.password);
    const userRole = input.role === "seller" ? "SELLER" : "BUYER";

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: userRole,
        phone: input.phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // Create a shop if registered as a seller
    if (userRole === "SELLER") {
      const baseSlug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      const shopSlug = `${baseSlug || "shop"}-${Date.now().toString(36)}`;
      await prisma.shop.create({
        data: {
          ownerId: user.id,
          name: `${user.name}'s Shop`,
          slug: shopSlug,
        },
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id);
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
      maxAge: 30 * 86400 * 1000,
    });

    // Send verification email
    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000),
      },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const verifyUrl = `${siteUrl}/verify-email?token=${token}`;
    const emailData = emailVerificationEmail(user.name, verifyUrl);
    await sendEmail({
      to: user.email,
      subject: emailData.subject,
      html: emailData.html,
    }).catch(console.error);

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.toLowerCase(),
        },
        token: accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new ApiError("Invalid email or password.", 401);
    }

    if (user.status !== "ACTIVE") {
      throw new ApiError(
        "Your account has been suspended or deactivated.",
        403,
      );
    }

    const isValid = await verifyPassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new ApiError("Invalid email or password.", 401);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id);
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
      maxAge: 30 * 86400 * 1000,
    });

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.toLowerCase(),
        },
        token: accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post("/logout", async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (refreshToken) {
      await revokeToken(refreshToken);
    }
    res.clearCookie(ACCESS_TOKEN_COOKIE, { path: "/" });
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });
    return res.json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get("/me", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.json({ success: true, data: { user: null, shop: null } });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        bio: true,
        status: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.json({ success: true, data: { user: null, shop: null } });
    }

    const formattedUser = {
      ...user,
      role: user.role.toLowerCase(),
    };

    const shop =
      formattedUser.role === "seller"
        ? await prisma.shop.findUnique({
            where: { ownerId: user.id },
            select: { id: true, name: true, slug: true, status: true },
          })
        : null;

    return res.json({
      success: true,
      data: {
        user: formattedUser,
        shop,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res, next) => {
  try {
    const input = forgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true, name: true, email: true },
    });

    if (user) {
      const token =
        Math.random().toString(36).slice(2) + Date.now().toString(36);
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
        },
      });

      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const resetUrl = `${siteUrl}/reset-password?token=${token}`;
      const emailData = passwordResetEmail(user.name, resetUrl);
      await sendEmail({
        to: user.email,
        subject: emailData.subject,
        html: emailData.html,
      }).catch(console.error);
    }

    return res.json({
      success: true,
      message:
        "If that email exists in our system, a password reset link has been sent.",
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res, next) => {
  try {
    const input = resetPasswordSchema.parse(req.body);
    const record = await prisma.passwordResetToken.findUnique({
      where: { token: input.token },
      include: { user: true },
    });

    if (!record || record.expiresAt.getTime() < Date.now() || record.usedAt) {
      throw new ApiError("Invalid or expired password reset link.", 400);
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

    return res.json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/verify-email
router.post("/verify-email", async (req, res, next) => {
  try {
    const token = req.body.token || req.query.token;
    if (!token || typeof token !== "string") {
      throw new ApiError("Verification token is required.", 400);
    }

    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record || record.expiresAt.getTime() < Date.now() || record.usedAt) {
      throw new ApiError("Invalid or expired verification token.", 400);
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

    return res.json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
