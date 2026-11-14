import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";

import { authenticateJwt } from "./middleware/auth";
import { errorHandler } from "./middleware/error";
import apiRouter from "./routes";

export function createExpressApp() {
  const app = express();

  // 1. Trust proxy for accurate client IP behind reverse proxy / Next.js
  app.set("trust proxy", 1);

  // 2. Strict CORS Allowlist
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    "http://localhost:3000",
    "http://localhost:3001",
  ].filter(Boolean) as string[];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const isDev = process.env.NODE_ENV !== "production";
        if (
          allowedOrigins.includes(origin) ||
          (isDev && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
        ) {
          return callback(null, true);
        }
        return callback(
          new Error("CORS policy does not allow access from this origin."),
        );
      },
      credentials: true,
    }),
  );

  app.use(cookieParser());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // 3. Security Rate Limiting
  const isTest = process.env.NODE_ENV === "test";
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: isTest ? 10000 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: isTest ? 10000 : 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many authentication attempts, please try again later.",
    },
  });

  app.use("/api", generalLimiter);
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
  app.use("/api/auth/forgot-password", authLimiter);
  app.use("/api/auth/reset-password", authLimiter);

  // 4. JWT Authentication Middleware (attaches req.user if valid token present)
  app.use(authenticateJwt);

  // 5. Mount API Router under /api
  app.use("/api", apiRouter);

  // 6. Centralized Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createExpressApp();
export default app;
