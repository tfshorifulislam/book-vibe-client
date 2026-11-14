# Fix Next.js 16 Blocking Prerender Current Time Error

Error location:

- `src/lib/auth/jwt.ts` line 87
- `src/lib/auth/session.ts`
- `src/app/seller/layout.tsx`

Problem:
`jwt.verify()` internally uses the current time during prerendering, causing Next.js 16 to throw a Blocking Route error.

## Tasks

1. Inspect the complete JWT authentication flow.
2. Make authenticated Seller, Admin, and Buyer layouts execute dynamically at request time.
3. Use Next.js `await connection()` from `next/server` in the appropriate Server Component layouts before calling authentication functions.
4. Verify `requireUser()` and `requireRole()` execute only in request-time server contexts.
5. Preserve JWT signature verification, expiration checks, refresh token rotation, and RBAC.
6. Do not disable JWT verification.
7. Do not replace `jwt.verify()` with insecure custom verification.
8. Do not add `"use client"` to server layouts.
9. Keep public pages statically prerenderable where possible.
10. Check other authenticated layouts for the same issue.

## Verification

- Run `npm run typecheck`
- Run `npm run lint`
- Run `npm run build`
- Test Seller, Admin, and Buyer authentication.
- Verify expired and invalid tokens are rejected.

Fix the root cause without weakening security or changing existing business logic.
