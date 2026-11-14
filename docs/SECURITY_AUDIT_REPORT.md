# BookHand — Application Security Audit & Hardening Report

**Generated:** November 14, 2026  
**Auditor:** Senior Application Security & Architecture Team  
**Scope:** Express Backend, Next.js Frontend Integration, Authentication, Database Access, and Proxy Controls  
**Status:** All Critical & High Vulnerabilities Mitigated (Production Ready)

---

## 1. Executive Summary

A comprehensive application security audit was conducted across the BookHand monorepo. Four primary vulnerability vectors identified during the initial audit have been resolved:
1. **Unrestricted CORS Configuration:** Wildcard origin reflection was replaced with a strict, environment-driven trusted origin allowlist.
2. **Missing Rate Limiting:** Brute-force and denial-of-service risks were addressed by deploying tiered rate limiters using `express-rate-limit`.
3. **Internal Query Proxy Vulnerability:** `backend/src/routes/internal.routes.ts` was locked down by removing hardcoded fallback secrets, eliminating environment bypasses, and enforcing a strict read-only whitelist on Prisma operations.
4. **Token & Cookie Lifecycle Hardening:** Verified secure JWT handling, refresh token rotation, session revocation, and HttpOnly/SameSite cookie attributes.

---

## 2. Detailed Findings & Remediations

### 2.1 CORS Allowlist Configuration
- **Initial Finding:** `app.use(cors({ origin: true, credentials: true }))` dynamically reflected any requesting `Origin` header. When paired with `credentials: true`, this allowed cross-origin websites to initiate credentialed requests if users visited a malicious site.
- **Implemented Fix (`backend/src/app.ts`):**
  - Configured an explicit trusted-origin list parsed from `FRONTEND_URL` and `NEXT_PUBLIC_SITE_URL`.
  - In `NODE_ENV !== "production"`, localhost origins (`http://localhost:3000`, `http://localhost:3001`, `http://127.0.0.1:3000`) are permitted for testing.
  - In production, only explicitly approved hostnames are accepted; requests from untrusted origins are rejected with a `403 Forbidden` CORS error.
  - Allowed headers, methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`), and max-age preflight caching (24 hours) were explicitly defined.

### 2.2 Rate Limiting Architecture
- **Initial Finding:** Authentication endpoints (`/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`) lacked request throttling, leaving them vulnerable to credential stuffing and distributed brute-force attacks.
- **Implemented Fix (`backend/src/app.ts`):**
  - **Proxy Trust:** Configured `app.set("trust proxy", 1)` so rate limiters inspect the real client IP forwarded by reverse proxies (e.g., NGINX, Cloudflare, AWS ALB) rather than rate-limiting the proxy server itself.
  - **General API Limiter:** Applied across all `/api/` endpoints (100 requests per minute per IP) to mitigate resource exhaustion.
  - **Sensitive Auth Limiter:** Applied to `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`, and `/api/auth/reset-password`:
    - Window: 15 minutes.
    - Max Requests: 10 per IP per window.
    - Standardized `429 Too Many Requests` JSON response.

### 2.3 Internal Query Proxy Hardening
- **Initial Finding:** `backend/src/routes/internal.routes.ts` served as a proxy for Next.js Server Components. It contained a default fallback secret string (`bookhand_internal_secret`) and bypassed authentication when `NODE_ENV === "development"`. Furthermore, it accepted arbitrary Prisma methods, allowing potentially dangerous writes or deletions.
- **Implemented Fix (`backend/src/routes/internal.routes.ts`):**
  - **Strict Secret Enforcement:** Removed hardcoded defaults and development bypasses. The endpoint requires a cryptographically strong secret (`INTERNAL_API_SECRET` or fallback to `SESSION_SECRET` / `JWT_SECRET`) across **all** environments. If no secret is configured, requests fail securely (500 Server Misconfiguration) rather than allowing unauthorized access.
  - **Read-Only Operation Whitelist:** Added an explicit whitelist for allowed Prisma operations:
    ```typescript
    const ALLOWED_OPERATIONS = new Set([
      "findMany",
      "findUnique",
      "findFirst",
      "count",
      "aggregate",
      "groupBy"
    ]);
    ```
    Any mutation attempts (`create`, `update`, `delete`, `deleteMany`, `executeRaw`, `queryRaw`) are rejected immediately with `403 Forbidden`.

### 2.4 Authentication & Token Lifecycle
- **JWT Architecture:**
  - **Access Tokens:** Signed with HMAC-SHA256, containing `userId` and `role`. Expiration set to 15 minutes to minimize the window of token compromise.
  - **Refresh Tokens:** High-entropy random hex tokens hashed and stored in PostgreSQL (`Session` model) with device tracking (`userAgent`, `ipAddress`) and expiration (7 days).
  - **Token Rotation:** Every refresh operation rotates both the access token and the refresh token family. Old refresh tokens are invalidated upon use. If a revoked token is replayed, all sessions for the user can be revoked.
- **Cookie Security:**
  - `HttpOnly`: Prevents client-side JavaScript access (XSS mitigation).
  - `SameSite=Lax`: Mitigates Cross-Site Request Forgery (CSRF).
  - `Secure`: Enabled in production to ensure transmission only over HTTPS.

### 2.5 Role-Based Access Control (RBAC) & Ownership Validation
- **Middleware Enforcement:**
  - Route handlers are guarded by `authenticate`, `requireRole(["admin"])`, `requireSeller`, and `requireBuyer`.
- **Resource Ownership:**
  - **Orders:** `PATCH /api/orders/:id` verifies `order.buyerId === req.user.userId`.
  - **Reviews:** `DELETE /api/reviews` verifies `review.userId === req.user.userId` (unless user is `admin`).
  - **Wishlist:** `DELETE /api/wishlist` scopes item removal strictly to the authenticated `req.user.userId`.
  - **Seller Actions:** Sellers can only manage books, coupons, and orders associated with their approved `shopId`.

---

## 3. Residual Risks & Production Recommendations

1. **Production Environment Secrets:**
   - Ensure `SESSION_SECRET`, `INTERNAL_API_SECRET`, and `DATABASE_URL` are supplied via secure secret management (e.g., AWS Secrets Manager, GCP Secret Manager, or Vercel Environment Variables).
   - Never commit `.env` or `.env.local` to Git repository.
2. **Reverse Proxy SSL Termination:**
   - Deploy behind a CDN/reverse proxy (Cloudflare, AWS CloudFront, or Nginx) with HTTPS enforced and HSTS (`Strict-Transport-Security`) headers enabled.
3. **Database Connection Pooling:**
   - In high-concurrency production deployments, use Prisma Accelerate or PgBouncer to manage database connection limits effectively.
