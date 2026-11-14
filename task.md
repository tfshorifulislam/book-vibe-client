# Fix Persistent JWT Prerender Error — Next.js 16.4.6

The `blocking-prerender-current-time` error still occurs.

**Current call stack:**
`SellerDashboardPage (page.tsx:23)` → `requireRole()` → `requireUser()` → `getCurrentUser()` → `verifyAccessToken()` → `jwt.verify()`.

**Tasks:**

1. Inspect `src/app/seller/dashboard/page.tsx`, especially line 23.
2. Import `connection` from `next/server`.
3. Call `await connection()` inside `SellerDashboardPage`, before calling `requireRole()` or any authentication function.
4. Audit all Server Components and pages that directly call `requireUser()`, `requireRole()` or `getCurrentUser()`.
5. Apply the same request-time boundary to those components where necessary.
6. Check Seller, Admin and Buyer routes. Do not assume that adding `connection()` to a parent layout has resolved every child route.
7. Keep `connection()` out of shared JWT/session utility functions.
8. Preserve `jwt.verify()`, signature validation, token expiration, refresh rotation, cookies and RBAC.
9. Do not use `jwt.decode()`, disable expiration checks, or add arbitrary timestamps.

**Expected pattern:**

```ts
import { connection } from "next/server";

export default async function SellerDashboardPage() {
  await connection();

  const user = await requireRole("SELLER");

  // Keep the existing dashboard implementation.
}
```

Adapt the role argument and existing function signature to the actual codebase.

**Final verification:**

- Run production build.
- Test Seller dashboard navigation with valid, expired and missing tokens.
- Test Admin and Buyer protected routes.
- Confirm public pages remain statically renderable.
- Report every modified file and the actual test results.

Do not stop after editing one file. Find and fix every affected authentication entry point.
