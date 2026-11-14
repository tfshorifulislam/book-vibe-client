import { Router } from "express";

import { prisma } from "@/lib/db";

const router = Router();

const ALLOWED_ACTIONS = new Set([
  "findMany",
  "findUnique",
  "findFirst",
  "count",
  "aggregate",
  "groupBy",
]);

// Internal data query proxy for frontend SSR
router.post("/query", async (req, res, next) => {
  try {
    const secret = req.headers["x-internal-secret"];
    const expected =
      process.env.INTERNAL_API_SECRET ||
      process.env.SESSION_SECRET ||
      process.env.JWT_SECRET;

    if (!expected || !secret || secret !== expected) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Invalid or missing internal proxy credentials.",
      });
    }

    const { model, action, args } = req.body;

    if (!ALLOWED_ACTIONS.has(action)) {
      return res.status(403).json({
        success: false,
        message: `Action ${action} is forbidden through internal query proxy. Only read actions are permitted.`,
      });
    }

    const delegate = (
      prisma as unknown as Record<
        string,
        Record<string, (a: unknown) => Promise<unknown>>
      >
    )[model];

    if (!delegate || typeof delegate[action] !== "function") {
      return res.status(400).json({
        success: false,
        message: `Invalid model ${model} or action ${action}`,
      });
    }

    const result = await delegate[action](args);
    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

export default router;
