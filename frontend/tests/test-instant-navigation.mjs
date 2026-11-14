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
console.log("   NEXT.JS 16.4.6 INSTANT NAVIGATION VERIFICATION");
console.log("=======================================================\n");

// 1. PUBLIC PAGES
console.log("--- 1. Public Pages Static & Instant Rendering ---");
{
  const resHome = await request("/");
  assert(resHome.status === 200, "Home page (/) returns 200 OK");
  assert(resHome.text.includes("BookHand"), "Home page contains site title");

  const resBooks = await request("/books");
  assert(resBooks.status === 200, "Catalog page (/books) returns 200 OK");

  const resAbout = await request("/about");
  assert(resAbout.status === 200, "About page (/about) returns 200 OK");

  const resLogin = await request("/login");
  assert(resLogin.status === 200, "Login page (/login) returns 200 OK");
}

// 2. MISSING TOKENS
console.log("\n--- 2. Unauthenticated Protected Route Access (Missing JWT) ---");
{
  const resSeller = await request("/seller/dashboard");
  assert(
    isRedirectTo(resSeller, "/login"),
    "Seller dashboard redirects unauthenticated request to /login"
  );

  const resAdmin = await request("/admin/dashboard");
  assert(
    isRedirectTo(resAdmin, "/login"),
    "Admin dashboard redirects unauthenticated request to /login"
  );

  const resBuyer = await request("/buyer/dashboard");
  assert(
    isRedirectTo(resBuyer, "/login"),
    "Buyer dashboard redirects unauthenticated request to /login"
  );
}

// 3. INVALID TOKENS
console.log("\n--- 3. Invalid / Corrupted JWT Handling ---");
{
  const badCookie = "bookhand_token=invalid.tampered.token";
  const res = await request("/seller/dashboard", badCookie);
  assert(
    isRedirectTo(res, "/login"),
    "Corrupted token is rejected and redirected to /login"
  );
}

// 4. EXPIRED TOKENS
console.log("\n--- 4. Expired JWT Handling (Date.now() Prerender Check) ---");
{
  const expiredToken = makeToken(
    { userId: "usr_expired_123", email: "expired@test.com", role: "seller" },
    { expiresIn: "-1h" } // expired 1 hour ago
  );
  const expiredCookie = `bookhand_token=${expiredToken}`;
  const res = await request("/seller/dashboard", expiredCookie);
  assert(
    isRedirectTo(res, "/login"),
    "Expired token redirects to /login without Date.now() prerender error"
  );
  assert(
    !res.text.includes("blocking-prerender-current-time"),
    "No blocking-prerender-current-time error in response"
  );
}

// 5. VALID TOKENS & STREAMING
console.log("\n--- 5. Valid JWT Protected Route Navigation & Streaming ---");
{
  // Valid Seller Token
  const sellerToken = makeToken(
    { userId: "cm4r1y06w000212e367gqg8r9", email: "seller1@test.com", role: "seller", name: "Jane Seller" },
    { expiresIn: "1h" }
  );
  const sellerCookie = `bookhand_token=${sellerToken}`;
  const resSeller = await request("/seller/dashboard", sellerCookie);
  assert(
    resSeller.status === 200,
    `Seller dashboard loads with valid token (status: ${resSeller.status})`
  );
  assert(
    !resSeller.text.includes("blocking-prerender-dynamic"),
    "Seller dashboard response has NO blocking-prerender-dynamic error"
  );
  assert(
    !resSeller.text.includes("blocking-prerender-current-time"),
    "Seller dashboard response has NO blocking-prerender-current-time error"
  );

  // Valid Buyer Token
  const buyerToken = makeToken(
    { userId: "cm4r1y06w000312e367gqg8r9", email: "buyer1@test.com", role: "buyer", name: "Alice Buyer" },
    { expiresIn: "1h" }
  );
  const buyerCookie = `bookhand_token=${buyerToken}`;
  const resBuyer = await request("/buyer/dashboard", buyerCookie);
  assert(
    resBuyer.status === 200,
    `Buyer dashboard loads with valid token (status: ${resBuyer.status})`
  );
  assert(
    !resBuyer.text.includes("blocking-prerender-dynamic"),
    "Buyer dashboard response has NO blocking-prerender-dynamic error"
  );
  assert(
    !resBuyer.text.includes("blocking-prerender-current-time"),
    "Buyer dashboard response has NO blocking-prerender-current-time error"
  );

  // Valid Admin Token
  const adminToken = makeToken(
    { userId: "cm4r1y06w000112e367gqg8r9", email: "admin@test.com", role: "admin", name: "Super Admin" },
    { expiresIn: "1h" }
  );
  const adminCookie = `bookhand_token=${adminToken}`;
  const resAdmin = await request("/admin/dashboard", adminCookie);
  assert(
    resAdmin.status === 200,
    `Admin dashboard loads with valid token (status: ${resAdmin.status})`
  );
  assert(
    !resAdmin.text.includes("blocking-prerender-dynamic"),
    "Admin dashboard response has NO blocking-prerender-dynamic error"
  );
  assert(
    !resAdmin.text.includes("blocking-prerender-current-time"),
    "Admin dashboard response has NO blocking-prerender-current-time error"
  );
}

// 6. RBAC VALIDATION
console.log("\n--- 6. Role-Based Access Control (RBAC) Redirection ---");
{
  const buyerToken = makeToken(
    { userId: "buyer_test", email: "buyer@test.com", role: "buyer", name: "Buyer" },
    { expiresIn: "1h" }
  );
  const resMismatch = await request("/seller/dashboard", `bookhand_token=${buyerToken}`);
  assert(
    isRedirectTo(resMismatch, "/buyer/dashboard"),
    "Buyer attempting to access seller dashboard is redirected to /buyer/dashboard"
  );

  const sellerToken = makeToken(
    { userId: "seller_test", email: "seller@test.com", role: "seller", name: "Seller" },
    { expiresIn: "1h" }
  );
  const resMismatchAdmin = await request("/admin/dashboard", `bookhand_token=${sellerToken}`);
  assert(
    isRedirectTo(resMismatchAdmin, "/seller/dashboard"),
    "Seller attempting to access admin dashboard is redirected to /seller/dashboard"
  );
}

console.log("\n=======================================================");
console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
}
