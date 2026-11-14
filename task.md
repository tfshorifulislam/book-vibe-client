Approved. Proceed with implementing the proposed Next.js + Express.js + Prisma + PostgreSQL + JWT architecture.

However, follow these additional requirements strictly:

1. First, verify PostgreSQL migration status. The previous audit confirmed that SQLite is still configured in schema.prisma. Do not assume migration is complete.
2. Never delete prisma/dev.db until PostgreSQL migration is verified, all existing records are migrated, and data integrity is confirmed.
3. Implement secure JWT authentication with access tokens, refresh tokens, HTTP-only cookies, token rotation, expiration, and revocation.
4. Preserve all existing Buyer, Seller, and Admin authentication, authorization, permissions, and business logic.
5. Migrate all existing API endpoints to Express.js incrementally. Do not remove or break existing functionality.
6. Configure Next.js rewrites to proxy /api/* requests to Express.js without breaking existing frontend requests.
7. Keep Resend and Cloudinary integrations server-side.
8. Use Zod for request validation and centralized Express error handling.
9. Maintain a clean modular backend architecture with separate routes, controllers, services, middleware, validators, and configuration.
10. Do not introduce duplicate implementations or unnecessary dependencies.

### Implementation Phases

Phase 1: PostgreSQL migration and data integrity.

Phase 2: Express.js server setup and modular API architecture.

Phase 3: JWT authentication and RBAC.

Phase 4: Migrate all 43 API endpoints.

Phase 5: Next.js proxy integration.

Phase 6: Resend and Cloudinary integration.

Phase 7: Full frontend/backend integration testing.

Phase 8: Production build and final audit.

After each phase:

- Run relevant tests.
- Fix errors before proceeding.
- Report changed files and verification results.

Do not delete existing functionality, test data, or database files without verified migration and explicit safety checks.

Begin implementation now. Do not stop after producing another plan.
