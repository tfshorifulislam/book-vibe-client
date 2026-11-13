# BookHand — Production Configuration Fix

You are working on the BookHand project.

The latest read-only audit identified several production configuration and integration issues. Fix them carefully and verify each implementation.

## Critical Rules

- Inspect the existing codebase before making changes.
- Preserve all existing features and business logic.
- Do not delete existing database records.
- Do not expose, print, or hardcode API keys or secrets.
- Never commit `.env` files.
- Do not blindly run destructive database commands.
- Preserve backward compatibility where reasonably possible.
- Do not claim something works without testing it.

## Priority 1: PostgreSQL Migration

Current issue:

- `prisma/schema.prisma` uses SQLite.
- `.env` contains a PostgreSQL connection URL.
- Prisma validation fails with P1012.

Tasks:

1. Inspect the complete Prisma schema and all database-related code.
2. Change the datasource provider to PostgreSQL.
3. Check SQLite-specific fields, defaults, types, indexes, relations, and queries for compatibility.
4. Review the existing SQLite database and identify its records.
5. Prepare a safe migration plan from SQLite to PostgreSQL.
6. Preserve all existing records and relationships.
7. Generate the Prisma client.
8. Validate the schema and test actual PostgreSQL connectivity.
9. Do not use `db push`, migrations, or database writes until the migration strategy and data preservation have been verified.

## Priority 2: Resend Email

Current issue:

- `EMAIL_FROM` uses a Gmail address.

Tasks:

1. Inspect `src/lib/email/service.ts` and email templates.
2. Verify the Resend integration.
3. Support the Resend development sender address where appropriate.
4. Ensure production sending requires a verified domain.
5. Verify registration, email verification, password reset, and notification flows.
6. Never log API keys or sensitive email content.

## Priority 3: Cloudinary Upload

Current issue:

- Cloudinary signed upload is missing the required SHA-1 signature.

Tasks:

1. Inspect `src/lib/storage.ts` and all upload API routes.
2. Implement Cloudinary's correct server-side signed upload process.
3. Generate signatures securely using Node.js crypto.
4. Never expose `CLOUDINARY_API_SECRET` to the browser.
5. Validate file type, size, and upload errors.
6. Verify that successful uploads return valid Cloudinary URLs.
7. Avoid silently treating local disk fallback as production success.
8. Keep local upload fallback development-only unless explicitly configured otherwise.

## Priority 4: Session Security

Current issue:

- `SESSION_SECRET` is configured but unused.
- Existing sessions use database-backed random tokens.

Tasks:

1. Inspect the complete authentication and session lifecycle.
2. Evaluate whether the current opaque-token approach is secure.
3. Verify token generation, storage, expiration, revocation, cookie flags, and session validation.
4. Keep the existing database-backed architecture unless a genuine security issue requires a change.
5. Either implement a justified use for `SESSION_SECRET` or document why it is unnecessary and remove the unused configuration requirement.
6. Do not replace the session architecture with JWT without a strong reason.

## Priority 5: Production Environment

1. Verify `NEXT_PUBLIC_SITE_URL` in all production URL generation flows.
2. Check that development-only fallbacks cannot accidentally run in production.
3. Verify environment variables are validated at startup.
4. Check that missing production credentials produce clear errors.
5. Confirm `.env` is ignored by Git.

## Verification

After implementation, run:

- Prisma validation
- Prisma client generation
- TypeScript checks
- ESLint
- Production build
- Relevant automated tests
- PostgreSQL connectivity test
- Resend integration test
- Cloudinary upload test
- Authentication/session security test

Do not report a test as PASS if it was not actually executed.

## Final Report

Provide:

1. Files changed
2. Issues fixed
3. Database migration status
4. Integration test results
5. Remaining blockers
6. Production readiness verdict

Use PASS / FAIL / BLOCKED for every verification item.

Do not deploy the application. Do not modify or delete production data.
