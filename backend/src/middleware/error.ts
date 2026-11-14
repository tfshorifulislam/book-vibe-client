import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Please check the submitted information.",
      details: err.issues,
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
    });
  }

  if ((err as { name?: string })?.name === "MulterError") {
    const multerErr = err as { code?: string; message?: string };
    if (multerErr.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "File exceeds the 5MB size limit.",
      });
    }
    return res.status(400).json({
      success: false,
      message: multerErr.message || "File upload error.",
    });
  }

  if (err instanceof Error) {
    if (err.message === "UNAUTHORIZED") {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to do that.",
      });
    }
  }

  console.error("[Express Error]", err);
  return res.status(500).json({
    success: false,
    message: "An internal server error occurred.",
  });
}
