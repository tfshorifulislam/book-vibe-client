Restructure BookHand into TWO COMPLETELY INDEPENDENT applications.

### Target Structure

```text
BookHand/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── node_modules/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── all Next.js configurations
│
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── node_modules/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── package-lock.json
│   └── all Express.js configurations
│
├── .gitignore
└── README.md
```

### Strict Requirements

1. Frontend must contain ONLY Next.js, React, TypeScript, UI libraries, and frontend dependencies.
2. Backend must contain ONLY Node.js, Express.js, TypeScript, Prisma, PostgreSQL-related packages, JWT, Resend, Cloudinary, and backend dependencies.
3. Each folder must have its own `package.json`, `package-lock.json`, `node_modules`, `.env`, and `.env.example`.
4. No shared dependencies, package files, or node_modules.
5. Frontend must run independently on port 3000.
6. Backend must run independently on port 5000.
7. Configure frontend API requests to communicate with the backend through its API URL.
8. Keep Prisma schema, migrations, and database logic exclusively in backend.
9. Keep all existing features, API endpoints, authentication, and business logic working.
10. Update all imports, scripts, environment variables, configurations, and README.
11. Remove obsolete root package files and dependencies after verifying both applications work independently.
12. Never commit actual `.env` files or secrets.

### Developer Independence

- Frontend developer should be able to clone the repository, enter `frontend/`, run `npm install`, and start the frontend.
- Backend developer should be able to clone the repository, enter `backend/`, run `npm install`, and start the backend.
- Neither developer should need to install dependencies from the other folder.

### Verification

Run independent installation, typecheck, lint, tests, and production builds wherever applicable.

Verify both applications work independently and communicate correctly.

Preserve all existing database records. Do not delete the SQLite database until PostgreSQL migration and data integrity are verified.

Complete the restructuring. Do not merely provide a plan.
