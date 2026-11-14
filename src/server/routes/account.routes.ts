import { Router } from "express";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/server/middleware/auth";
import { ApiError } from "@/server/middleware/error";
import { passwordChangeSchema, profileUpdateSchema } from "@/lib/validators";

const router = Router();

// PATCH /api/account/profile
router.patch("/profile", requireAuth, async (req, res, next) => {
  try {
    const input = profileUpdateSchema.parse(req.body);
    const updated = await prisma.user.update({
      where: { id: req.user!.userId },
      data: input,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        bio: true,
        role: true,
      },
    });

    return res.json({
      success: true,
      data: {
        ...updated,
        role: updated.role.toLowerCase(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/account/password
router.patch("/password", requireAuth, async (req, res, next) => {
  try {
    const input = passwordChangeSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { passwordHash: true },
    });

    if (!user) throw new ApiError("User not found.", 404);

    const isValid = await verifyPassword(
      input.currentPassword,
      user.passwordHash,
    );
    if (!isValid) {
      throw new ApiError("Current password does not match.", 400);
    }

    const newHash = await hashPassword(input.newPassword);
    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { passwordHash: newHash },
    });

    return res.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
