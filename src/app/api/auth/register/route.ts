import { randomBytes } from "node:crypto";

import { fail, handleError, ok, readJson } from "@/lib/api";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const input = registerSchema.parse(await readJson(request));
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    });
    if (existing) {
      return fail("An account with this email already exists.", 409);
    }

    const passwordHash = await hashPassword(input.password);
    const shopSlug =
      input.role === "seller"
        ? await uniqueSlug(
            input.shopName || `${input.name}-shop`,
            async (slug) =>
              Boolean(await prisma.shop.findUnique({ where: { slug } })),
          )
        : null;

    const verificationToken = randomBytes(24).toString("hex");
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        phone: input.phone,
        role: input.role === "seller" ? "SELLER" : "BUYER",
        cart: { create: {} },
        wishlist: { create: {} },
        emailVerificationTokens: {
          create: {
            token: verificationToken,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        },
        notifications: {
          create: {
            type: "SYSTEM",
            title: "Welcome to BookHand",
            message:
              input.role === "seller"
                ? "Your seller account is ready. Complete your shop profile and list your first book."
                : "Your account is ready. Start exploring books from trusted sellers.",
            href: input.role === "seller" ? "/seller/dashboard" : "/books",
          },
        },
        ...(input.role === "seller" && shopSlug
          ? {
              shop: {
                create: {
                  name: input.shopName || `${input.name}'s Shop`,
                  slug: shopSlug,
                  description: "A new BookHand seller shop.",
                  status: "ACTIVE",
                },
              },
            }
          : {}),
      },
      select: { id: true, name: true, email: true, role: true, avatar: true },
    });

    await createSession(user.id);

    return ok(
      {
        user: { ...user, role: user.role.toLowerCase() },
        verificationUrl:
          process.env.NODE_ENV === "development"
            ? `/verify-email?token=${verificationToken}`
            : undefined,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleError(error);
  }
}
