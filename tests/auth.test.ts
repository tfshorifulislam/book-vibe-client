import { describe, it } from "node:test";
import assert from "node:assert";
import { hashPassword, verifyPassword } from "../src/lib/auth/password";
import { dashboardFor } from "../src/lib/auth/session";
import { loginSchema, registerSchema } from "../src/lib/validators";

describe("Authentication & Security", () => {
  it("should securely hash and verify passwords using scrypt and timingSafeEqual", async () => {
    const password = "SecurePassword@123";
    const hashed = await hashPassword(password);

    assert.ok(
      hashed.startsWith("scrypt$"),
      "Hash should start with scrypt algorithm identifier",
    );
    assert.strictEqual(
      await verifyPassword(password, hashed),
      true,
      "Password should verify successfully",
    );
    assert.strictEqual(
      await verifyPassword("WrongPassword", hashed),
      false,
      "Wrong password should fail verification",
    );
  });

  it("should validate valid login credentials using Zod", () => {
    const valid = loginSchema.safeParse({
      email: "buyer@bookhand.com",
      password: "Password123",
    });
    assert.strictEqual(valid.success, true);

    const invalidEmail = loginSchema.safeParse({
      email: "invalid-email",
      password: "Password123",
    });
    assert.strictEqual(invalidEmail.success, false);
  });

  it("should validate registration inputs and enforce password requirements", () => {
    const validBuyer = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "Password@123",
      role: "buyer",
    });
    assert.strictEqual(validBuyer.success, true);

    const invalidShortPass = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "short",
      role: "buyer",
    });
    assert.strictEqual(invalidShortPass.success, false);
  });

  it("should correctly resolve role-based dashboard destinations", () => {
    assert.strictEqual(dashboardFor("admin"), "/admin/dashboard");
    assert.strictEqual(dashboardFor("seller"), "/seller/dashboard");
    assert.strictEqual(dashboardFor("buyer"), "/buyer/dashboard");
  });
});
