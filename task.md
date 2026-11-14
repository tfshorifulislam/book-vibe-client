# Fix Next.js 16 Blocking Prerender Error in BookHand

Investigate the `InstantServer` / `blocking-prerender-dynamic` error.

**Error location:**

- `src/lib/auth/session.ts:232` — `requireUser()` calls `await connection()`
- `src/app/seller/dashboard/page.tsx:23` — calls `requireUser()` through `requireRole()`

**Tasks:**

1. Inspect `requireUser()`, `requireRole()`, `getCurrentUser()` and all their usages.
2. Do not call `connection()` inside shared authentication helpers.
3. Identify which pages/layouts require request-time authentication.
4. Apply the appropriate Next.js 16 rendering strategy:
   - Use `<Suspense>` boundaries where streaming is appropriate.
   - Use `export const instant = false` only for routes that genuinely require blocking dynamic rendering.
5. Check Seller, Admin and Buyer protected routes for the same issue.
6. Keep public pages eligible for instant/static rendering.
7. Preserve JWT verification, expiration checks, refresh-token rotation, cookies, redirects and RBAC.
8. Never bypass authentication or weaken security to fix this error.

**Verification:**

- Run TypeScript, ESLint and production build.
- Test authenticated and unauthenticated navigation.
- Test expired and invalid JWTs.
- Confirm protected pages render correctly without blocking unrelated public pages.

Make the smallest correct architectural change. Do not apply a global workaround.
