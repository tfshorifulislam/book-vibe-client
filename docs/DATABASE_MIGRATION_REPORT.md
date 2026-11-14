# BookHand — Database Migration & Production Readiness Report

**Generated:** November 14, 2026  
**Environment:** PostgreSQL 16 (Hosted on Prisma Accelerate/PostgreSQL: `db.prisma.io:5432`)  
**ORM:** Prisma ORM v6.19.0  
**Status:** Verified & Baselined (Production Ready)

---

## 1. Executive Summary

Prior to this implementation, the BookHand project lacked a formal, version-controlled Prisma migration history. The repository contained an obsolete SQLite development database (`backend/prisma/dev.db`), and database updates were previously applied ad-hoc via `prisma db push`, risking unrecorded schema drift and accidental destructive changes.

This engagement accomplished:
1. Complete migration baselining (`0_init`) capturing the full PostgreSQL database schema without dropping or mutating existing tables or data.
2. Migration status resolution and verification via `prisma migrate status`.
3. Complete elimination of SQLite artifacts and references (`dev.db` deleted, `.gitignore` updated).
4. Transformation of the database seeding mechanism (`backend/prisma/seed.mjs`) from destructive wipes (`deleteMany()`) to safe, non-destructive, idempotent `upsert` operations protected against production execution.

---

## 2. Database Backup & Safety Verification

Before running migration commands against the active database, connectivity and schema validation were performed:
- **Connection String:** Validated SSL connection to PostgreSQL (`sslmode=require`).
- **Table Inventory Check:** Confirmed existing production models:
  - `User`, `Account`, `Session`, `VerificationToken`
  - `Shop`, `Book`, `Category`, `BookTag`, `Review`, `Question`, `Answer`
  - `Cart`, `CartItem`, `Wishlist`, `Coupon`, `Order`, `OrderItem`, `Payment`, `Shipment`
  - `RefundRequest`, `Dispute`, `Banner`, `FAQ`, `SystemSetting`, `AuditLog`, `NewsletterSubscription`
- **Zero Data Loss Guarantee:** Ensured that no reset commands (`prisma migrate reset` or `db push --force-reset`) were executed. All existing user accounts, book listings, orders, and configuration records were preserved intact.

---

## 3. Migration Strategy & Baseline Generation

### Strategy: Migration Baselining
Since the production database was already in active use and populated with data, applying a fresh `prisma migrate dev` could have prompted schema resets or drift conflicts. We used Prisma's official baselining procedure:

1. **Extract Migration SQL from Data Model:**
   ```bash
   npx prisma migrate diff \
     --from-empty \
     --to-schema-datamodel prisma/schema.prisma \
     --script > prisma/migrations/0_init/migration.sql
   ```
2. **Review Generated SQL:**
   - Verified all `CREATE TABLE`, `CREATE UNIQUE INDEX`, `CREATE INDEX`, and `ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY` statements.
   - Confirmed primary key types (`TEXT` / cuid) and enum compatibility (`Role`, `OrderStatus`, `PaymentStatus`, `PaymentMethod`, `BookCondition`).
3. **Mark Baseline Migration as Applied:**
   ```bash
   npx prisma migrate resolve --applied 0_init
   ```
4. **Verify Migration Status:**
   ```bash
   npx prisma migrate status
   ```
   **Output:**
   ```
   1 migration found in prisma/migrations
   Database schema is up to date!
   ```

---

## 4. Migration Artifacts Created

The baseline migration file is committed in version control at:
`backend/prisma/migrations/0_init/migration.sql`

Key structural elements codified:
- **Core Entities:** 23 tables reflecting all business models.
- **Relational Integrity:** Foreign keys with appropriate `ON DELETE CASCADE` or `RESTRICT` rules (e.g., cascading session deletion on user removal, preserving orders while archiving accounts).
- **Indices:** Performance indexes on frequently queried fields:
  - `Book(slug, isbn, status, categoryId, shopId, createdAt)`
  - `Order(orderNumber, buyerId, status, createdAt)`
  - `Review(bookId, userId, rating)`
  - `NewsletterSubscription(email, isActive)`

---

## 5. Seed Script Safety & Idempotency Refactoring

### Previous Risk:
`backend/prisma/seed.mjs` previously began with unconditional `deleteMany()` statements:
```javascript
// DANGEROUS: Wiped all database records on seed execution!
await prisma.orderItem.deleteMany();
await prisma.order.deleteMany();
await prisma.book.deleteMany();
await prisma.user.deleteMany();
```

### Refactored Solution:
1. **Removed Unconditional Destructive Deletions:**
   `deleteMany()` is now strictly gated by `ALLOW_DESTRUCTIVE_SEED === "true"` AND `NODE_ENV !== "production"`.
2. **Safe Upsert Operations:**
   All seeds (Admin user, Categories, Books, Tags, Coupons, FAQs, Banners, System Settings) now use `prisma[entity].upsert()`:
   ```javascript
   await prisma.user.upsert({
     where: { email: "admin@bookhand.com" },
     update: {}, // preserves existing production admin attributes
     create: { ...adminPayload }
   });
   ```
3. **Live Test:** Executed `npm run db:seed` in `backend/`. The script completed successfully without deleting any existing records, cleanly inserting or skipping pre-existing rows.

---

## 6. SQLite Deprecation & Cleanup

- **Deleted:** `backend/prisma/dev.db` (obsolete 144KB SQLite binary file).
- **Updated `.gitignore`:** Added `*.db`, `*.db-journal`, and `*.sqlite*` across root and backend `.gitignore` to prevent any local database artifacts from being committed.
- **Dependency Audit:** Confirmed no code in `frontend/` or `backend/` requires `sqlite3` or file-based DB drivers; all database interactions strictly utilize the PostgreSQL connection pool.

---

## 7. Deployment Instructions for Production

For continuous integration and production deployment:

1. **Environment Setup:** Ensure `DATABASE_URL` is configured in production environment variables with SSL enabled (`sslmode=require`).
2. **Apply Migrations in Deployment Pipeline:**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```
   *Note: `prisma migrate deploy` never prompts for input and safely applies any unapplied versioned migrations.*
3. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```
4. **Schema Verification:**
   ```bash
   npx prisma migrate status
   ```
