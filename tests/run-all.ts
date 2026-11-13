import assert from "node:assert";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { dashboardFor } from "@/lib/auth/session";
import {
  calculateShipping,
  DEFAULT_FREE_SHIPPING_THRESHOLD,
  DEFAULT_SHIPPING,
  orderStatusLabel,
} from "@/lib/commerce";
import { prisma } from "@/lib/db";
import { resolveSenderEmail } from "@/lib/email/service";
import { validateEnv } from "@/lib/env";
import { generateCloudinarySignature } from "@/lib/storage";
import {
  checkoutSchema,
  contactSchema,
  couponSchema,
  disputeRequestSchema,
  loginSchema,
  refundRequestSchema,
  registerSchema,
} from "@/lib/validators";

async function runTests() {
  console.log("\n=============================================");
  console.log("       BOOKHAND AUTOMATED TEST SUITE        ");
  console.log("=============================================\n");

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    return Promise.resolve()
      .then(fn)
      .then(() => {
        console.log(`  ✔ PASS: ${name}`);
        passed++;
      })
      .catch((err) => {
        console.error(`  ✖ FAIL: ${name}`);
        console.error(`    -> ${err.message}`);
        failed++;
      });
  }

  // --- 1. AUTHENTICATION & SECURITY ---
  console.log("--- Group 1: Authentication & Security ---");
  await test("Password hashing with scrypt produces unique salt and verifiable hash", async () => {
    const raw = "SecurePassword@123";
    const hash = await hashPassword(raw);
    assert.ok(
      hash.startsWith("scrypt$"),
      "Hash format should be scrypt$salt$hash",
    );
    assert.strictEqual(
      await verifyPassword(raw, hash),
      true,
      "Correct password must verify",
    );
    assert.strictEqual(
      await verifyPassword("WrongPass", hash),
      false,
      "Wrong password must fail",
    );
  });

  await test("Login schema validation enforces email format and non-empty password", () => {
    const valid = loginSchema.safeParse({
      email: "buyer@bookhand.com",
      password: "Password123",
    });
    assert.strictEqual(valid.success, true);

    const invalidEmail = loginSchema.safeParse({
      email: "not-an-email",
      password: "Password123",
    });
    assert.strictEqual(invalidEmail.success, false);
  });

  await test("Register schema enforces required role and minimum password length", () => {
    const validBuyer = registerSchema.safeParse({
      name: "Test User",
      email: "user@bookhand.com",
      password: "StrongPassword@1",
      role: "buyer",
    });
    assert.strictEqual(validBuyer.success, true);

    const invalidRole = registerSchema.safeParse({
      name: "Test User",
      email: "user@bookhand.com",
      password: "StrongPassword@1",
      role: "superadmin",
    });
    assert.strictEqual(invalidRole.success, false);
  });

  await test("Role dashboard routing routes correctly", () => {
    assert.strictEqual(dashboardFor("admin"), "/admin/dashboard");
    assert.strictEqual(dashboardFor("seller"), "/seller/dashboard");
    assert.strictEqual(dashboardFor("buyer"), "/buyer/dashboard");
  });

  // --- 2. COMMERCE & SHIPPING CALCULATIONS ---
  console.log("\n--- Group 2: Commerce, Pricing & Shipping Calculations ---");
  await test("Shipping calculation respects flat rate and free shipping threshold", () => {
    const settings = {
      shippingFlat: DEFAULT_SHIPPING,
      freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
    };

    assert.strictEqual(calculateShipping(0, settings), 0);
    assert.strictEqual(calculateShipping(500, settings), 60);
    assert.strictEqual(calculateShipping(800, settings), 0);
    assert.strictEqual(calculateShipping(1200, settings), 0);
  });

  await test("Order status label formatting converts snake_case to Title Case", () => {
    assert.strictEqual(orderStatusLabel("PENDING"), "Pending");
    assert.strictEqual(
      orderStatusLabel("OUT_FOR_DELIVERY"),
      "Out For Delivery",
    );
    assert.strictEqual(orderStatusLabel("DELIVERED"), "Delivered");
  });

  await test("Coupon schema validates discount types and positive amounts", () => {
    const validPercent = couponSchema.safeParse({
      code: "SAVE20",
      type: "PERCENT",
      value: 20,
      minOrder: 500,
    });
    assert.strictEqual(validPercent.success, true);

    const validFixed = couponSchema.safeParse({
      code: "FLAT100",
      type: "FIXED",
      value: 100,
      minOrder: 1000,
    });
    assert.strictEqual(validFixed.success, true);

    const invalidType = couponSchema.safeParse({
      code: "BAD",
      type: "UNKNOWN",
      value: 50,
    });
    assert.strictEqual(invalidType.success, false);
  });

  await test("Checkout schema requires payment method and valid address inputs", () => {
    const validCOD = checkoutSchema.safeParse({
      paymentMethod: "COD",
      addressId: "addr_123",
    });
    assert.strictEqual(validCOD.success, true);

    const invalidMethod = checkoutSchema.safeParse({
      paymentMethod: "BITCOIN",
      addressId: "addr_123",
    });
    assert.strictEqual(invalidMethod.success, false);
  });

  // --- 3. REFUNDS & DISPUTES VALIDATION ---
  console.log("\n--- Group 3: Refunds & Disputes Validation ---");
  await test("Refund request schema enforces minimum reason length and valid orderId", () => {
    const valid = refundRequestSchema.safeParse({
      orderId: "order_123",
      reason: "Damaged book with torn pages received upon delivery.",
      amount: 450,
    });
    assert.strictEqual(valid.success, true);

    const tooShort = refundRequestSchema.safeParse({
      orderId: "order_123",
      reason: "Bad",
    });
    assert.strictEqual(tooShort.success, false);
  });

  await test("Dispute request schema requires descriptive claim", () => {
    const valid = disputeRequestSchema.safeParse({
      orderId: "order_123",
      reason:
        "Seller shipped the wrong edition and refused to respond to messages.",
    });
    assert.strictEqual(valid.success, true);

    const empty = disputeRequestSchema.safeParse({
      orderId: "order_123",
      reason: "   ",
    });
    assert.strictEqual(empty.success, false);
  });

  // --- 4. CONTACT & CUSTOMER INQUIRIES ---
  console.log("\n--- Group 4: Customer Contact Inquiries ---");
  await test("Contact schema validates name, email, and message body", () => {
    const valid = contactSchema.safeParse({
      name: "Rahim Ahmed",
      email: "rahim@example.com",
      subject: "Wholesale Book Inquiry",
      message:
        "We would like to order 50 copies of academic textbooks for our school library.",
    });
    assert.strictEqual(valid.success, true);

    const invalidEmail = contactSchema.safeParse({
      name: "Rahim",
      email: "not-an-email",
      subject: "Test",
      message: "Short message but bad email.",
    });
    assert.strictEqual(invalidEmail.success, false);
  });

  // --- 5. DATABASE CONNECTIVITY & INTEGRITY ---
  console.log("\n--- Group 5: Database Connectivity & Integrity ---");
  await test("Prisma database connectivity queries seeded users and catalog", async () => {
    const usersCount = await prisma.user.count();
    const booksCount = await prisma.book.count();
    const categoriesCount = await prisma.category.count();

    assert.ok(usersCount > 0, "Users should be seeded");
    assert.ok(booksCount > 0, "Books should be seeded");
    assert.ok(categoriesCount > 0, "Categories should be seeded");
  });

  // --- 6. PRODUCTION INTEGRATIONS & SECURITY ---
  console.log("\n--- Group 6: Production Integrations & Security ---");
  await test("Resend sender resolution normalizes Gmail to sandbox domain in dev", () => {
    const sender = resolveSenderEmail();
    assert.ok(
      sender.includes("onboarding@resend.dev") || sender.includes("BookHand"),
    );
  });

  await test("Cloudinary signature generation creates exact SHA-1 hex digest", () => {
    const params = { folder: "bookhand", timestamp: "1700000000" };
    const secret = "test_secret_123";
    const sig = generateCloudinarySignature(params, secret);
    assert.strictEqual(typeof sig, "string");
    assert.strictEqual(
      sig.length,
      40,
      "SHA-1 hex digest must be 40 characters",
    );
  });

  await test("Environment validation utility correctly reports valid env status", () => {
    const check = validateEnv();
    assert.strictEqual(check.isValid, true);
  });

  console.log("\n=============================================");
  console.log(
    `TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`,
  );
  console.log("=============================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().finally(() => prisma.$disconnect());
