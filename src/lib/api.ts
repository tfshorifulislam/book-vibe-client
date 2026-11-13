import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth/session";
import type { User, UserRole } from "@/types";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    { success: false, message, details },
    { status },
  );
}

export function handleError(error: unknown) {
  unstable_rethrow(error);
  if (error instanceof ZodError) {
    return fail("Please check the submitted information.", 422, error.issues);
  }
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return fail("Authentication required.", 401);
  }
  if (error instanceof Error && error.message === "FORBIDDEN") {
    return fail("You do not have permission to do that.", 403);
  }
  console.error(error);
  return fail("Something went wrong. Please try again.", 500);
}

export async function currentUser(): Promise<User | null> {
  return getCurrentUser();
}

export async function requireApiUser(
  role?: UserRole | UserRole[],
): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role)) throw new Error("FORBIDDEN");
  }
  return user;
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new Error("INVALID_JSON");
  }
}

export function pagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(searchParams.get("limit") ?? 20) || 20),
  );
  return { page, limit, skip: (page - 1) * limit };
}

export function toNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}
