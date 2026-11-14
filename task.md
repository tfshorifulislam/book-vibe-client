Restructure the BookHand project into two completely separate folders:

```text
BookHand/
├── frontend/
│   ├── Next.js 16
│   ├── React 19
│   ├── TypeScript
│   └── Frontend dependencies and configuration
│
├── backend/
│   ├── Node.js
│   ├── Express.js
│   ├── TypeScript
│   ├── Prisma
│   ├── PostgreSQL
│   ├── JWT
│   ├── Resend
│   └── Cloudinary
│
└── README.md
```

### Requirements

1. Move all frontend code and dependencies into `frontend/`.
2. Move all Express backend code, Prisma schema, migrations, and backend dependencies into `backend/`.
3. Configure frontend on port `3000` and backend on port `5000`.
4. Update API proxy, environment variables, scripts, imports, and configurations.
5. Keep frontend and backend independently installable and runnable.
6. Preserve all existing features, API endpoints, authentication, and database data.
7. Update `.gitignore` and README.
8. Remove duplicate and obsolete files only after verifying they are unused.

Do not redesign or rewrite application logic. Do not lose data. Run typecheck, lint, tests, and production builds for both folders.

Work directly and complete the restructuring. Report the final folder structure and verification results.
