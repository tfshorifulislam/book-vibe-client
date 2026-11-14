# Fix Root Cause: BookHand Authentication + Next.js 16.4.6

The same prerender error keeps appearing on different Seller pages.

**Current error:**
`src/lib/auth/jwt.ts:111` — `rotateRefreshToken()` → `prisma.session.findUnique()`.

**Call stack:**
`SellerAnalyticsPage` → `requireRole()` → `requireUser()` → `getCurrentUser()` → `rotateRefreshToken()` → Prisma.

Previous fixes addressed individual pages and introduced additional navigation errors. Stop applying isolated fixes.

### Required architecture

1. Audit ALL Seller, Admin and Buyer protected pages and layouts.
2. Create a reusable Server Component pattern for protected pages:
   - Keep the route page as a synchronous component.
   - Wrap the authenticated async content component in React `<Suspense>` with an appropriate loading fallback.
   - Inside the async content component, call `await connection()` before authentication and uncached database operations.
   - Perform `requireUser()` / `requireRole()` and Prisma queries inside this component.
3. Apply this architecture consistently to every affected protected route, including Dashboard, Analytics, Books, Orders and other protected pages.
4. Remove misplaced `connection()` calls from shared auth utilities and route-level components where they cause blocking navigation errors.
5. Never cache session validation, refresh-token rotation, JWT verification or user-specific Prisma queries.
6. Preserve token revocation checks, expiration validation, JWT signatures, refresh rotation, RBAC and redirects.
7. Do not use `jwt.decode()` or weaken authentication.
8. Keep public pages statically renderable.

### Example pattern

```tsx
import { Suspense } from "react";
import { connection } from "next/server";

export default function SellerAnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsLoading />}>
      <SellerAnalyticsContent />
    </Suspense>
  );
}

async function SellerAnalyticsContent() {
  await connection();

  const user = await requireRole("seller");

  // Keep existing Prisma queries and UI here.
}
```

Adapt imports, types, components and existing UI to the actual project. Do not replace existing dashboard functionality with placeholders.

### Verification

- Run production build and TypeScript checks.
- Test navigation across ALL protected routes.
- Test missing, invalid, expired and revoked tokens.
- Confirm refresh-token rotation works.
- Confirm neither `blocking-prerender-current-time` nor `blocking-prerender-dynamic` occurs.
- Confirm public routes remain unaffected.
- Provide a list of every modified file and actual test results.

Do not stop after fixing Analytics. Audit and fix the complete authentication architecture.
