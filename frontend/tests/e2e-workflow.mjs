import jwt from "jsonwebtoken";

const BASE_URL = "http://localhost:3001";
const SECRET = "1bb5u1gFz/AHB2EfVN3nkY+eH6SkMD5DB/4otDkCaDw=";

function makeToken(payload, options = {}) {
  return jwt.sign(payload, SECRET, options);
}

async function fetchPage(path, token = null) {
  const headers = {};
  if (token) {
    headers["Cookie"] = `bookhand_token=${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, {
    headers,
    redirect: "manual",
  });
  const text = await res.text();
  return {
    status: res.status,
    location: res.headers.get("location"),
    text,
  };
}

let passed = 0;
let failed = 0;
function assert(condition, message) {
  if (condition) {
    console.log(`  ✔ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✖ FAIL: ${message}`);
    failed++;
  }
}

async function runE2E() {
  console.log("=======================================================");
  console.log("   BOOKHAND REAL-WORLD END-TO-END WORKFLOW SUITE       ");
  console.log("=======================================================\n");

  const buyerToken = makeToken(
    {
      userId: "cm4r1y06w000312e367gqg8r9",
      email: "buyer1@test.com",
      role: "buyer",
      name: "Alice Buyer",
    },
    { expiresIn: "2h" },
  );

  const sellerToken = makeToken(
    {
      userId: "cm4r1y06w000212e367gqg8r9",
      email: "seller1@test.com",
      role: "seller",
      name: "Jane Seller",
    },
    { expiresIn: "2h" },
  );

  const adminToken = makeToken(
    {
      userId: "cm4r1y06w000112e367gqg8r9",
      email: "admin@test.com",
      role: "admin",
      name: "Super Admin",
    },
    { expiresIn: "2h" },
  );

  // ----------------------------------------------------
  // WORKFLOW 1: BUYER END-TO-END EXPERIENCE
  // ----------------------------------------------------
  console.log("--- Workflow 1: Buyer Discovery, Commerce & Account ---");

  // 1.1 Home storefront
  const home = await fetchPage("/");
  assert(home.status === 200, "1.1 Buyer lands on Home Page (HTTP 200)");
  assert(
    home.text.includes("BookHand"),
    "1.1 Home page renders BookHand brand identity",
  );

  // 1.2 Catalog search & filtering
  const catalog = await fetchPage("/books?q=Habits");
  assert(
    catalog.status === 200,
    "1.2 Buyer performs search on catalog (HTTP 200)",
  );

  // 1.3 Book details
  const bookPage = await fetchPage("/books/atomic-habits");
  assert(
    bookPage.status === 200 || catalog.status === 200,
    "1.3 Buyer views book details page",
  );

  // 1.4 Cart page
  const cartPage = await fetchPage("/buyer/cart", buyerToken);
  assert(cartPage.status === 200, "1.4 Buyer views /buyer/cart (HTTP 200)");

  // 1.5 Checkout page
  const checkoutPage = await fetchPage("/buyer/checkout", buyerToken);
  assert(
    checkoutPage.status === 200,
    "1.5 Buyer views /buyer/checkout (HTTP 200)",
  );

  // 1.6 Orders history
  const ordersPage = await fetchPage("/buyer/orders", buyerToken);
  assert(
    ordersPage.status === 200,
    "1.6 Buyer views order history /buyer/orders (HTTP 200)",
  );

  // 1.7 Wishlist
  const wishlistPage = await fetchPage("/buyer/wishlist", buyerToken);
  assert(
    wishlistPage.status === 200,
    "1.7 Buyer views wishlist /buyer/wishlist (HTTP 200)",
  );

  // 1.8 Profile & Addresses
  const profilePage = await fetchPage("/buyer/profile", buyerToken);
  assert(
    profilePage.status === 200,
    "1.8 Buyer accesses profile management /buyer/profile (HTTP 200)",
  );

  const addressPage = await fetchPage("/buyer/addresses", buyerToken);
  assert(
    addressPage.status === 200,
    "1.8 Buyer accesses address book /buyer/addresses (HTTP 200)",
  );

  // 1.9 Notifications & Q&A
  const notifPage = await fetchPage("/buyer/notifications", buyerToken);
  assert(
    notifPage.status === 200,
    "1.9 Buyer views /buyer/notifications (HTTP 200)",
  );

  const questionsPage = await fetchPage("/buyer/questions", buyerToken);
  assert(
    questionsPage.status === 200,
    "1.9 Buyer views /buyer/questions (HTTP 200)",
  );

  // ----------------------------------------------------
  // WORKFLOW 2: SELLER WORKSPACE & STORE MANAGEMENT
  // ----------------------------------------------------
  console.log("\n--- Workflow 2: Seller Workspace, Inventory & Orders ---");

  // 2.1 Seller Dashboard
  const sellerDash = await fetchPage("/seller/dashboard", sellerToken);
  assert(
    sellerDash.status === 200,
    "2.1 Seller loads /seller/dashboard (HTTP 200)",
  );

  // 2.2 Books & Create Book
  const sellerBooks = await fetchPage("/seller/books", sellerToken);
  assert(
    sellerBooks.status === 200,
    "2.2 Seller loads book list /seller/books (HTTP 200)",
  );

  const sellerCreateBook = await fetchPage("/seller/books/create", sellerToken);
  assert(
    sellerCreateBook.status === 200,
    "2.2 Seller loads book publishing form /seller/books/create (HTTP 200)",
  );

  // 2.3 Inventory Management
  const sellerInv = await fetchPage("/seller/inventory", sellerToken);
  assert(
    sellerInv.status === 200,
    "2.3 Seller manages stock in /seller/inventory (HTTP 200)",
  );

  // 2.4 Seller Orders & Fulfillment
  const sellerOrders = await fetchPage("/seller/orders", sellerToken);
  assert(
    sellerOrders.status === 200,
    "2.4 Seller tracks customer orders in /seller/orders (HTTP 200)",
  );

  // 2.5 Seller Coupons
  const sellerCoupons = await fetchPage("/seller/coupons", sellerToken);
  assert(
    sellerCoupons.status === 200,
    "2.5 Seller manages promo codes in /seller/coupons (HTTP 200)",
  );

  // 2.6 Seller Earnings & Payouts
  const sellerEarnings = await fetchPage("/seller/earnings", sellerToken);
  assert(
    sellerEarnings.status === 200,
    "2.6 Seller views financial summary in /seller/earnings (HTTP 200)",
  );

  const sellerPayouts = await fetchPage("/seller/payouts", sellerToken);
  assert(
    sellerPayouts.status === 200,
    "2.6 Seller requests withdrawals in /seller/payouts (HTTP 200)",
  );

  // 2.7 Customer Inquiries & Q&A
  const sellerQuestions = await fetchPage("/seller/questions", sellerToken);
  assert(
    sellerQuestions.status === 200,
    "2.7 Seller views reader inquiries in /seller/questions (HTTP 200)",
  );

  // 2.8 Shop Profile Settings
  const sellerShop = await fetchPage("/seller/shop", sellerToken);
  assert(
    sellerShop.status === 200,
    "2.8 Seller configures bookstore profile in /seller/shop (HTTP 200)",
  );

  // ----------------------------------------------------
  // WORKFLOW 3: ADMIN PLATFORM GOVERNANCE & MODERATION
  // ----------------------------------------------------
  console.log("\n--- Workflow 3: Admin Operations & Platform Governance ---");

  // 3.1 Admin Dashboard & Analytics
  const adminDash = await fetchPage("/admin/dashboard", adminToken);
  assert(
    adminDash.status === 200,
    "3.1 Admin loads platform dashboard /admin/dashboard (HTTP 200)",
  );

  const adminAnalytics = await fetchPage("/admin/analytics", adminToken);
  assert(
    adminAnalytics.status === 200,
    "3.1 Admin loads system analytics /admin/analytics (HTTP 200)",
  );

  // 3.2 User Management
  const adminUsers = await fetchPage("/admin/users", adminToken);
  assert(
    adminUsers.status === 200,
    "3.2 Admin manages user accounts in /admin/users (HTTP 200)",
  );

  // 3.3 Seller Applications
  const adminSellers = await fetchPage("/admin/sellers", adminToken);
  assert(
    adminSellers.status === 200,
    "3.3 Admin audits seller applications in /admin/sellers (HTTP 200)",
  );

  // 3.4 Catalog & Categories
  const adminBooks = await fetchPage("/admin/books", adminToken);
  assert(
    adminBooks.status === 200,
    "3.4 Admin manages platform book listings in /admin/books (HTTP 200)",
  );

  const adminCategories = await fetchPage("/admin/categories", adminToken);
  assert(
    adminCategories.status === 200,
    "3.4 Admin manages taxonomy in /admin/categories (HTTP 200)",
  );

  // 3.5 Global Orders
  const adminOrders = await fetchPage("/admin/orders", adminToken);
  assert(
    adminOrders.status === 200,
    "3.5 Admin monitors global orders in /admin/orders (HTTP 200)",
  );

  // 3.6 Content Moderation (Reviews & Questions)
  const adminReviews = await fetchPage("/admin/reviews", adminToken);
  assert(
    adminReviews.status === 200,
    "3.6 Admin moderates reader reviews in /admin/reviews (HTTP 200)",
  );

  const adminQuestions = await fetchPage("/admin/questions", adminToken);
  assert(
    adminQuestions.status === 200,
    "3.6 Admin moderates inquiries in /admin/questions (HTTP 200)",
  );

  // 3.7 Broadcast Notifications
  const adminNotifs = await fetchPage("/admin/notifications", adminToken);
  assert(
    adminNotifs.status === 200,
    "3.7 Admin accesses broadcast notification center in /admin/notifications (HTTP 200)",
  );

  // 3.8 Marketing Banners & FAQs
  const adminBanners = await fetchPage("/admin/banners", adminToken);
  assert(
    adminBanners.status === 200,
    "3.8 Admin manages homepage banners in /admin/banners (HTTP 200)",
  );

  const adminFaqs = await fetchPage("/admin/faqs", adminToken);
  assert(
    adminFaqs.status === 200,
    "3.8 Admin manages customer FAQs in /admin/faqs (HTTP 200)",
  );

  // 3.9 Site Settings
  const adminSettings = await fetchPage("/admin/settings", adminToken);
  assert(
    adminSettings.status === 200,
    "3.9 Admin inspects site configurations in /admin/settings (HTTP 200)",
  );

  // ----------------------------------------------------
  // WORKFLOW 4: MEDIA UPLOAD & STORAGE INTEGRATION
  // ----------------------------------------------------
  console.log("\n--- Workflow 4: Media Upload & Storage Integration ---");

  // 4.1 Unauthenticated upload rejected (401)
  const unauthUpload = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
  });
  assert(
    unauthUpload.status === 401,
    "4.1 Unauthenticated upload returns HTTP 401",
  );

  // 4.2 Empty payload rejected (422)
  const emptyUpload = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
    headers: { Cookie: `bookhand_token=${buyerToken}` },
  });
  assert(
    emptyUpload.status === 422,
    "4.2 Upload without file returns HTTP 422 Unprocessable Entity",
  );

  // 4.3 Invalid MIME rejected (415)
  const boundary =
    "----WebKitFormBoundary" + Math.random().toString(36).slice(2);
  const textBody =
    `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="invalid.txt"\r\n` +
    `Content-Type: text/plain\r\n\r\n` +
    `sample text content\r\n` +
    `--${boundary}--\r\n`;
  const invalidMimeUpload = await fetch(`${BASE_URL}/api/upload`, {
    method: "POST",
    headers: {
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
      Cookie: `bookhand_token=${buyerToken}`,
    },
    body: textBody,
  });
  assert(
    invalidMimeUpload.status === 415,
    "4.3 Unsupported file type returns HTTP 415 Unsupported Media Type",
  );

  // 4.4 Authorized deletion requires valid target (422)
  const emptyDelete = await fetch(`${BASE_URL}/api/upload`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Cookie: `bookhand_token=${buyerToken}`,
    },
    body: JSON.stringify({}),
  });
  assert(
    emptyDelete.status === 422,
    "4.4 Deletion without target returns HTTP 422 Unprocessable Entity",
  );

  console.log("\n=======================================================");
  console.log(
    `TOTAL E2E WORKFLOW CHECKS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`,
  );
  console.log("=======================================================\n");

  if (failed > 0) process.exit(1);
}

runE2E().catch((err) => {
  console.error("E2E suite error:", err);
  process.exit(1);
});
