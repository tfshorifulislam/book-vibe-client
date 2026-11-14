# BookHand — Online Books Marketplace

BookHand is a full-featured multi-vendor book marketplace platform for readers, sellers, and administrators across Bangladesh.

The project is structured into two completely decoupled folders:

```text
BookHand/
├── frontend/          # Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui (Port 3000)
├── backend/           # Node.js, Express.js, TypeScript, Prisma, PostgreSQL, JWT (Port 5000)
└── README.md
```

---

## Architecture Overview

### Frontend (`frontend/`)
- **Framework:** Next.js 16.4.6 (App Router & Turbopack)
- **UI & Styling:** React 19, Tailwind CSS 4, shadcn/ui components, Lucide icons
- **Default Port:** `3000` (`http://localhost:3000`)
- **API Proxy:** In `next.config.ts`, all `/api/*` HTTP requests are proxied directly to the Express backend (`http://localhost:5000/api/*`).
- **Features:**
  - Storefront catalog, search, book filters, categories, authors, publishers, deals, and FAQs.
  - Buyer portal: cart, multi-step checkout, order tracking, printable invoices, refunds, disputes, reviews, Q&A, and profile management.
  - Seller portal: book management, order fulfillment, coupon creation, inventory logs, payouts, and shop settings.
  - Admin dashboard: user management, order oversight, financial transactions, commission settings, review moderation, refund approvals, and site settings.

### Backend (`backend/`)
- **Framework:** Express.js 5.3 + TypeScript
- **Database & ORM:** PostgreSQL (remote Prisma Postgres) via Prisma 6.19
- **Authentication:** JWT (15-minute access token + database-backed rotating 30-day refresh token in HTTP-only cookies)
- **Default Port:** `5000` (`http://localhost:5000`)
- **Services:**
  - Resend transactional email integration (account verification, password reset, order confirmation).
  - Cloudinary signed image upload integration with size and MIME validation.
  - Payment gateway interfaces for bKash, SSLCommerz, and Stripe webhooks.
  - Role-based access control (RBAC) middleware for Buyer, Seller, and Admin routes.

---

## Getting Started

### 1. Prerequisites
- Node.js 20+ (tested with Node.js 24)
- PostgreSQL database (remote or local)

### 2. Environment Setup

#### Backend Configuration (`backend/.env`):
```bash
PORT=5000
NODE_ENV=development
DATABASE_URL="postgres://..."
JWT_SECRET="your-jwt-secret"
SESSION_SECRET="your-session-secret"
RESEND_API_KEY="re_..."
EMAIL_FROM="BookHand <onboarding@resend.dev>"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

#### Frontend Configuration (`frontend/.env.local`):
```bash
PORT=3000
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:5000"
API_BASE_URL="http://localhost:5000"
DATABASE_URL="postgres://..."
SESSION_SECRET="your-session-secret"
```

---

## Running the Applications Independently

Each application is completely independent with its own `package.json`, `package-lock.json`, and dependencies. No root package dependencies exist.

### Running Backend Independently (Port 5000):
```bash
cd backend
npm install       # Install backend dependencies
npm run dev       # Starts Express API server on http://localhost:5000
npm test          # Runs automated test suite (20 tests)
npm run typecheck # TypeScript validation (0 errors)
npm run lint      # ESLint check (0 errors)
```

### Running Frontend Independently (Port 3000):
```bash
cd frontend
npm install       # Install frontend dependencies
npm run dev       # Starts Next.js on http://localhost:3000
npm run build     # Production build with Turbopack (109 routes)
npm run typecheck # TypeScript validation (0 errors)
npm run lint      # ESLint check (0 errors)
```

### Running Frontend Independently:
```bash
cd frontend
npm run dev       # Starts Next.js on http://localhost:3000
npm run build     # Production build using Turbopack
npm run typecheck # TypeScript validation
npm run lint      # ESLint check
```

---

## Testing & Verification

The backend includes a comprehensive 20-test automated suite covering:
1. Password hashing with scrypt.
2. Login and registration schema validation with role checks.
3. Commerce pricing, shipping calculations, and coupon limits.
4. Buyer refund requests and dispute claims validation.
5. Live PostgreSQL database connectivity and entity integrity.
6. Resend email sender resolution in development and test environments.
7. Cloudinary SHA-1 signature generation for secure image uploads.
8. JWT lifecycle (signing, verification, refresh token rotation, revocation).
9. Express REST endpoints (catalog, auth, cart, RBAC permissions for Buyer/Admin).
10. Next.js rewrite proxy architecture.

Run the tests anytime:
```bash
cd backend && npm test
```
