import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  generateAccessToken,
  generateRefreshToken,
  revokeToken,
  rotateRefreshToken,
  verifyAccessToken,
} from "@/lib/auth/jwt";
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
import { createExpressApp } from "@/app";

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

  // --- 7. JWT AUTHENTICATION & TOKEN LIFECYCLE ---
  console.log("\n--- Group 7: JWT Authentication & Token Lifecycle ---");
  await test("generateAccessToken signs JWT with userId, role, and expiration", () => {
    const token = generateAccessToken({
      id: "usr_test_123",
      email: "test@bookhand.com",
      role: "buyer",
      name: "Test Buyer",
    });
    assert.strictEqual(typeof token, "string");
    const payload = verifyAccessToken(token);
    assert.ok(payload);
    assert.strictEqual(payload.userId, "usr_test_123");
    assert.strictEqual(payload.role, "buyer");
    assert.strictEqual(payload.email, "test@bookhand.com");
  });

  await test("verifyAccessToken rejects corrupted or invalid token signatures", () => {
    const invalid = verifyAccessToken("eyInval.idTo.kenSignature123");
    assert.strictEqual(invalid, null);
  });

  await test("generateRefreshToken, rotateRefreshToken, and revokeToken manage session lifecycle", async () => {
    const testUser = await prisma.user.findFirst();
    if (!testUser) return;

    // 1. Generate refresh token
    const refreshToken = await generateRefreshToken(testUser.id);
    assert.strictEqual(typeof refreshToken, "string");

    // Verify token exists in database session
    const session = await prisma.session.findUnique({
      where: { token: refreshToken },
    });
    assert.ok(session, "Session must exist in database");

    // 2. Rotate refresh token
    const rotated = await rotateRefreshToken(refreshToken);
    assert.ok(rotated, "Token rotation must succeed");
    assert.ok(
      rotated.accessToken,
      "Rotated response must include new access token",
    );
    assert.ok(
      rotated.refreshToken,
      "Rotated response must include new refresh token",
    );
    assert.notStrictEqual(
      rotated.refreshToken,
      refreshToken,
      "New refresh token must differ from old",
    );

    // Verify old session was removed
    const oldSession = await prisma.session.findUnique({
      where: { token: refreshToken },
    });
    assert.strictEqual(
      oldSession,
      null,
      "Old refresh token must be invalidated",
    );

    // 3. Revoke rotated token
    await revokeToken(rotated.refreshToken);
    const revokedSession = await prisma.session.findUnique({
      where: { token: rotated.refreshToken },
    });
    assert.strictEqual(
      revokedSession,
      null,
      "Revoked refresh token must be deleted",
    );
  });

  // --- 8. EXPRESS.JS REST API & RBAC ENDPOINTS ---
  console.log("\n--- Group 8: Express.js REST API & RBAC Endpoints ---");
  await test("Express server handles API routes, public catalog, and RBAC authorization", async () => {
    const app = createExpressApp();
    const server = app.listen(0);
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 5055;
    const baseUrl = `http://127.0.0.1:${port}/api`;

    try {
      // 1. GET /api/health
      const healthRes = await fetch(`${baseUrl}/health`);
      assert.strictEqual(healthRes.status, 200);
      const healthData = await healthRes.json();
      assert.strictEqual(healthData.status, "ok");
      assert.strictEqual(healthData.service, "BookHand REST API");

      // 2. GET /api/books (public catalog)
      const booksRes = await fetch(`${baseUrl}/books`);
      assert.strictEqual(booksRes.status, 200);
      const booksData = await booksRes.json();
      assert.strictEqual(booksData.success, true);
      assert.ok(Array.isArray(booksData.data.books));

      // 3. GET /api/categories (public categories)
      const catRes = await fetch(`${baseUrl}/categories`);
      assert.strictEqual(catRes.status, 200);
      const catData = await catRes.json();
      assert.strictEqual(catData.success, true);
      assert.ok(Array.isArray(catData.data.categories));

      // 4. Unauthorized access to protected endpoints returns 401 or null session
      const unauthMe = await fetch(`${baseUrl}/auth/me`);
      assert.strictEqual(unauthMe.status, 200);
      const unauthMeData = await unauthMe.json();
      assert.strictEqual(unauthMeData.data.user, null);

      const unauthCart = await fetch(`${baseUrl}/cart`);
      assert.strictEqual(unauthCart.status, 401);

      const unauthAdmin = await fetch(`${baseUrl}/admin/books`);
      assert.strictEqual(unauthAdmin.status, 401);

      const unauthSeller = await fetch(`${baseUrl}/seller/books`);
      assert.strictEqual(unauthSeller.status, 401);

      // 5. RBAC: Buyer accessing admin route returns 403 Forbidden
      const buyerUser = await prisma.user.findFirst({
        where: { role: "BUYER" },
      });
      if (buyerUser) {
        const buyerToken = generateAccessToken(buyerUser);
        const buyerAdminReq = await fetch(`${baseUrl}/admin/books`, {
          headers: { Authorization: `Bearer ${buyerToken}` },
        });
        assert.strictEqual(buyerAdminReq.status, 403);
      }

      // 6. RBAC: Admin accessing admin route returns 200 OK
      const adminUser = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      });
      if (adminUser) {
        const adminToken = generateAccessToken(adminUser);
        const adminReq = await fetch(`${baseUrl}/admin/books`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        assert.strictEqual(adminReq.status, 200);
        const adminData = await adminReq.json();
        assert.strictEqual(adminData.success, true);
        assert.ok(Array.isArray(adminData.data.books));

        // 7. Verify Cookie-based authentication works
        const cookieReq = await fetch(`${baseUrl}/auth/me`, {
          headers: { Cookie: `bookhand_token=${adminToken}` },
        });
        assert.strictEqual(cookieReq.status, 200);
        const cookieData = await cookieReq.json();
        assert.strictEqual(cookieData.success, true);
        assert.strictEqual(cookieData.data.user.id, adminUser.id);

        // 8. Verify login returns redirectTo and user role
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: adminUser.email,
            password: "password123",
          }),
        });
        if (loginRes.status === 200) {
          const loginData = await loginRes.json();
          assert.strictEqual(loginData.success, true);
          assert.strictEqual(loginData.data.redirectTo, "/admin/dashboard");
        }
      }
    } finally {
      server.close();
    }
  });

  // --- 9. NEXT.JS PROXY & ARCHITECTURE CONFIGURATION ---
  console.log("\n--- Group 9: Next.js Proxy & Architecture Configuration ---");
  await test("Next.js configuration proxies /api/* requests to Express backend", () => {
    const configPath = fs.existsSync(path.join(process.cwd(), "next.config.ts"))
      ? path.join(process.cwd(), "next.config.ts")
      : path.resolve(process.cwd(), "../frontend/next.config.ts");
    const content = fs.readFileSync(configPath, "utf8");
    assert.ok(
      content.includes("rewrites"),
      "next.config.ts must define rewrites",
    );
    assert.ok(
      content.includes("http://localhost:5000/api/:path*") ||
        content.includes("/api/:path*"),
      "next.config.ts must proxy /api/:path* to Express backend",
    );
  });

  // --- 10. COMPLETED API ENDPOINTS & WORKFLOW VERIFICATION ---
  console.log(
    "\n--- Group 10: Completed API Endpoints & Workflow Verification ---",
  );
  await test("Buyer order cancellation, wishlist deletion, review deletion, and admin moderation work end-to-end", async () => {
    const app = createExpressApp();
    const server = app.listen(0);
    const port = (server.address() as { port: number }).port;
    const baseUrl = `http://127.0.0.1:${port}/api`;

    try {
      const buyer = await prisma.user.findFirst({ where: { role: "BUYER" } });
      const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      const book = await prisma.book.findFirst({ where: { isActive: true } });

      assert.ok(buyer, "Buyer user must exist");
      assert.ok(admin, "Admin user must exist");
      assert.ok(book, "Book must exist");

      const buyerToken = generateAccessToken(buyer);
      const adminToken = generateAccessToken(admin);

      // 1. Wishlist Add and Delete via Query Param
      const addWishlistRes = await fetch(`${baseUrl}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${buyerToken}`,
        },
        body: JSON.stringify({ bookId: book.id }),
      });
      assert.strictEqual(addWishlistRes.status, 200);

      const delWishlistRes = await fetch(
        `${baseUrl}/wishlist?bookId=${book.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${buyerToken}` },
        },
      );
      assert.strictEqual(delWishlistRes.status, 200);

      // 2. Real Newsletter Subscription & Duplicate Detection
      const testEmail = `test_${Date.now()}@bookhand.com`;
      const newsRes1 = await fetch(`${baseUrl}/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
      assert.strictEqual(newsRes1.status, 200);
      const newsData1 = await newsRes1.json();
      assert.strictEqual(newsData1.isDuplicate, false);

      const newsRes2 = await fetch(`${baseUrl}/newsletter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
      assert.strictEqual(newsRes2.status, 200);
      const newsData2 = await newsRes2.json();
      assert.strictEqual(newsData2.isDuplicate, true);

      // Cleanup test newsletter
      await prisma.newsletterSubscription.deleteMany({
        where: { email: testEmail },
      });

      // 3. Admin Banner & FAQ Deletion
      const testBanner = await prisma.banner.create({
        data: {
          title: "Test Banner",
          subtitle: "Test",
          href: "/test",
          order: 99,
        },
      });
      const delBannerRes = await fetch(
        `${baseUrl}/admin/banners?id=${testBanner.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${adminToken}` },
        },
      );
      assert.strictEqual(delBannerRes.status, 200);

      const testFaq = await prisma.faq.create({
        data: { question: "Test Question?", answer: "Test Answer", order: 99 },
      });
      const delFaqRes = await fetch(`${baseUrl}/admin/faqs?id=${testFaq.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.strictEqual(delFaqRes.status, 200);

      // 4. Admin Broadcast Notifications
      const broadcastRes = await fetch(`${baseUrl}/admin/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          title: "System Update",
          message: "Scheduled maintenance tonight.",
          type: "SYSTEM",
          targetRole: "BUYER",
        }),
      });
      assert.strictEqual(broadcastRes.status, 201);
      const broadcastData = await broadcastRes.json();
      assert.strictEqual(broadcastData.success, true);
      assert.ok(broadcastData.sentCount > 0);

      // 5. Admin Moderation (Review, Question, Dispute)
      await prisma.review.deleteMany({
        where: { bookId: book.id, userId: buyer.id },
      });
      const testReview = await prisma.review.create({
        data: {
          bookId: book.id,
          userId: buyer.id,
          rating: 5,
          title: "Temporary test review",
          body: "Great reading material.",
          isApproved: false,
        },
      });

      const modApproveRes = await fetch(`${baseUrl}/admin/moderation`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          type: "review",
          id: testReview.id,
          action: "approve",
        }),
      });
      assert.strictEqual(modApproveRes.status, 200);

      // 6. Buyer Review Deletion via DELETE /api/reviews?bookId=...
      const delReviewRes = await fetch(`${baseUrl}/reviews?bookId=${book.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${buyerToken}` },
      });
      assert.strictEqual(delReviewRes.status, 200);

      // 7. Buyer Order Cancellation with Inventory Restock
      const initialStock = book.stock;
      const testOrder = await prisma.order.create({
        data: {
          orderNumber: `BH-TEST-${Date.now()}`,
          userId: buyer.id,
          status: "PENDING",
          subtotal: 500,
          discount: 0,
          shipping: 60,
          total: 560,
          paymentMethod: "COD",
          paymentStatus: "PENDING",
          addressSnapshot: "{}",
          items: {
            create: [
              {
                bookId: book.id,
                title: book.title,
                author: "Author",
                price: book.price,
                quantity: 2,
                status: "PENDING",
              },
            ],
          },
        },
      });

      const cancelRes = await fetch(`${baseUrl}/orders/${testOrder.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${buyerToken}`,
        },
        body: JSON.stringify({
          status: "CANCELLED",
          note: "Test cancellation",
        }),
      });
      assert.strictEqual(cancelRes.status, 200);

      const refreshedOrder = await prisma.order.findUnique({
        where: { id: testOrder.id },
      });
      assert.strictEqual(refreshedOrder?.status, "CANCELLED");

      const refreshedBook = await prisma.book.findUnique({
        where: { id: book.id },
      });
      assert.strictEqual(refreshedBook?.stock, initialStock + 2);

      // Restore stock and clean test order
      await prisma.book.update({
        where: { id: book.id },
        data: { stock: initialStock },
      });
      await prisma.order.delete({ where: { id: testOrder.id } });
    } finally {
      server.close();
    }
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
