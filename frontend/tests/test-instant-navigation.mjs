import jwt from "jsonwebtoken";

const BASE_URL = "http://localhost:3001";
const SECRET = "1bb5u1gFz/AHB2EfVN3nkY+eH6SkMD5DB/4otDkCaDw=";

function makeToken(payload, options = {}) {
  return jwt.sign(payload, SECRET, options);
}

async function request(path, cookie = null) {
  const headers = {};
  if (cookie) {
    headers["Cookie"] = cookie;
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

function isRedirectTo(res, targetPath) {
  if (res.status === 307 || res.status === 308) {
    return res.location === targetPath || res.location?.includes(targetPath);
  }
  if (res.status === 200) {
    return res.text.includes(targetPath);
  }
  return false;
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

console.log("\n=======================================================");
console.log("   COMPREHENSIVE NEXT.JS 16.4.6 AUTHENTICATION &");
console.log("   INSTANT NAVIGATION TEST SUITE");
console.log("=======================================================\n");

// 1. PUBLIC ROUTES
console.log("--- 1. Public Routes Static Prerender & Navigation ---");
{
  const publicRoutes = [
    "/",
    "/books",
    "/about",
    "/login",
    "/register",
    "/contact",
    "/help",
  ];
  for (const route of publicRoutes) {
    const res = await request(route);
    assert(res.status === 200, `Public route ${route} returns 200 OK`);
  }
}

// 2. UNAUTHENTICATED ACCESS (MISSING TOKENS)
console.log("\n--- 2. Unauthenticated Access across Protected Routes ---");
{
  const protectedRoutes = [
    { path: "/seller/dashboard", role: "seller" },
    { path: "/seller/analytics", role: "seller" },
    { path: "/seller/books", role: "seller" },
    { path: "/seller/inventory", role: "seller" },
    { path: "/seller/orders", role: "seller" },
    { path: "/seller/earnings", role: "seller" },
    { path: "/seller/payouts", role: "seller" },
    { path: "/seller/settings", role: "seller" },
    { path: "/admin/dashboard", role: "admin" },
    { path: "/admin/analytics", role: "admin" },
    { path: "/admin/books", role: "admin" },
    { path: "/admin/sellers", role: "admin" },
    { path: "/admin/users", role: "admin" },
    { path: "/admin/shops", role: "admin" },
    { path: "/buyer/dashboard", role: "buyer" },
    { path: "/buyer/orders", role: "buyer" },
    { path: "/buyer/wishlist", role: "buyer" },
    { path: "/buyer/cart", role: "buyer" },
    { path: "/buyer/checkout", role: "buyer" },
    { path: "/buyer/profile", role: "buyer" },
    { path: "/buyer/settings", role: "buyer" },
  ];

  for (const { path } of protectedRoutes) {
    const res = await request(path);
    assert(
      isRedirectTo(res, "/login"),
      `Unauthenticated ${path} redirects to /login`,
    );
  }
}

// 3. INVALID / CORRUPTED TOKENS
console.log("\n--- 3. Invalid & Tampered Tokens ---");
{
  const badCookie = "bookhand_token=tampered.header.payload.signature";
  const resSeller = await request("/seller/analytics", badCookie);
  assert(
    isRedirectTo(resSeller, "/login"),
    "Tampered token accessing /seller/analytics rejected and redirects to /login",
  );

  const resAdmin = await request("/admin/analytics", badCookie);
  assert(
    isRedirectTo(resAdmin, "/login"),
    "Tampered token accessing /admin/analytics rejected and redirects to /login",
  );
}

// 4. EXPIRED JWT HANDLING
console.log(
  "\n--- 4. Expired JWTs (Date.now() / SyncIO Prerender Verification) ---",
);
{
  const expiredToken = makeToken(
    { userId: "expired_usr", email: "expired@test.com", role: "seller" },
    { expiresIn: "-2h" },
  );
  const expiredCookie = `bookhand_token=${expiredToken}`;

  const resAnalytics = await request("/seller/analytics", expiredCookie);
  assert(
    isRedirectTo(resAnalytics, "/login"),
    "Expired token accessing /seller/analytics redirects to /login",
  );
  assert(
    !resAnalytics.text.includes("blocking-prerender-current-time"),
    "No blocking-prerender-current-time error in /seller/analytics response",
  );
  assert(
    !resAnalytics.text.includes("blocking-prerender-dynamic"),
    "No blocking-prerender-dynamic error in /seller/analytics response",
  );

  const resSellerBooks = await request("/seller/books", expiredCookie);
  assert(
    isRedirectTo(resSellerBooks, "/login"),
    "Expired token accessing /seller/books redirects to /login",
  );
}

// 5. VALID TOKENS & STREAMING NAVIGATION
console.log("\n--- 5. Valid JWT Streaming Navigation Across Roles ---");
{
  // Seller
  const sellerToken = makeToken(
    {
      userId: "cm4r1y06w000212e367gqg8r9",
      email: "seller1@test.com",
      role: "seller",
      name: "Jane Seller",
    },
    { expiresIn: "2h" },
  );
  const sellerCookie = `bookhand_token=${sellerToken}`;

  const sellerPages = [
    "/seller/dashboard",
    "/seller/analytics",
    "/seller/books",
    "/seller/inventory",
    "/seller/orders",
    "/seller/earnings",
    "/seller/payouts",
    "/seller/coupons",
    "/seller/settings",
  ];

  for (const page of sellerPages) {
    const res = await request(page, sellerCookie);
    assert(res.status === 200, `Seller page ${page} loads with status 200`);
    assert(
      !res.text.includes("blocking-prerender-dynamic"),
      `Seller page ${page} has NO blocking-prerender-dynamic error`,
    );
    assert(
      !res.text.includes("blocking-prerender-current-time"),
      `Seller page ${page} has NO blocking-prerender-current-time error`,
    );
  }

  // Admin
  const adminToken = makeToken(
    {
      userId: "cm4r1y06w000112e367gqg8r9",
      email: "admin@test.com",
      role: "admin",
      name: "Super Admin",
    },
    { expiresIn: "2h" },
  );
  const adminCookie = `bookhand_token=${adminToken}`;

  const adminPages = [
    "/admin/dashboard",
    "/admin/analytics",
    "/admin/books",
    "/admin/sellers",
    "/admin/users",
    "/admin/shops",
  ];

  for (const page of adminPages) {
    const res = await request(page, adminCookie);
    assert(res.status === 200, `Admin page ${page} loads with status 200`);
    assert(
      !res.text.includes("blocking-prerender-dynamic"),
      `Admin page ${page} has NO blocking-prerender-dynamic error`,
    );
    assert(
      !res.text.includes("blocking-prerender-current-time"),
      `Admin page ${page} has NO blocking-prerender-current-time error`,
    );
  }

  // Buyer
  const buyerToken = makeToken(
    {
      userId: "cm4r1y06w000312e367gqg8r9",
      email: "buyer1@test.com",
      role: "buyer",
      name: "Alice Buyer",
    },
    { expiresIn: "2h" },
  );
  const buyerCookie = `bookhand_token=${buyerToken}`;

  const buyerPages = [
    "/buyer/dashboard",
    "/buyer/orders",
    "/buyer/wishlist",
    "/buyer/cart",
    "/buyer/coupons",
    "/buyer/profile",
    "/buyer/settings",
  ];

  for (const page of buyerPages) {
    const res = await request(page, buyerCookie);
    assert(res.status === 200, `Buyer page ${page} loads with status 200`);
    assert(
      !res.text.includes("blocking-prerender-dynamic"),
      `Buyer page ${page} has NO blocking-prerender-dynamic error`,
    );
    assert(
      !res.text.includes("blocking-prerender-current-time"),
      `Buyer page ${page} has NO blocking-prerender-current-time error`,
    );
  }
}

// 6. RBAC ENFORCEMENT & REDIRECTION
console.log("\n--- 6. Role-Based Access Control (RBAC) ---");
{
  const buyerToken = makeToken(
    {
      userId: "buyer_test",
      email: "buyer@test.com",
      role: "buyer",
      name: "Buyer",
    },
    { expiresIn: "1h" },
  );
  const resBuyerOnSeller = await request(
    "/seller/analytics",
    `bookhand_token=${buyerToken}`,
  );
  assert(
    isRedirectTo(resBuyerOnSeller, "/buyer/dashboard"),
    "Buyer attempting to access /seller/analytics is redirected to /buyer/dashboard",
  );

  const resBuyerOnAdmin = await request(
    "/admin/analytics",
    `bookhand_token=${buyerToken}`,
  );
  assert(
    isRedirectTo(resBuyerOnAdmin, "/buyer/dashboard"),
    "Buyer attempting to access /admin/analytics is redirected to /buyer/dashboard",
  );

  const sellerToken = makeToken(
    {
      userId: "seller_test",
      email: "seller@test.com",
      role: "seller",
      name: "Seller",
    },
    { expiresIn: "1h" },
  );
  const resSellerOnAdmin = await request(
    "/admin/dashboard",
    `bookhand_token=${sellerToken}`,
  );
  assert(
    isRedirectTo(resSellerOnAdmin, "/seller/dashboard"),
    "Seller attempting to access /admin/dashboard is redirected to /seller/dashboard",
  );
}

console.log("\n=======================================================");
console.log(
  `TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`,
);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
}
