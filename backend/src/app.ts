import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import { authenticateJwt } from "./middleware/auth";
import { errorHandler } from "./middleware/error";
import apiRouter from "./routes";

export function createExpressApp() {
  const app = express();

  // 1. Basic Middleware
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // 2. JWT Authentication Middleware (attaches req.user if valid token present)
  app.use(authenticateJwt);

  // 3. Mount API Router under /api
  app.use("/api", apiRouter);

  // 4. Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createExpressApp();
export default app;
