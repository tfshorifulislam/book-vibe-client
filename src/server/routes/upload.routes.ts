import { randomUUID } from "node:crypto";
import { Router } from "express";
import multer from "multer";

import { uploadImage } from "@/lib/storage";
import { requireAuth } from "@/server/middleware/auth";
import { ApiError } from "@/server/middleware/error";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const ALLOWED_MIME = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

// POST /api/upload
router.post(
  "/upload",
  requireAuth,
  upload.single("file"),
  async (req, res, next) => {
    try {
      const file = req.file;
      if (!file) throw new ApiError("Choose an image to upload.", 422);

      const ext = ALLOWED_MIME.get(file.mimetype);
      if (!ext) {
        throw new ApiError(
          "Please upload a JPG, PNG, WebP, or AVIF image.",
          415,
        );
      }

      const filename = `${randomUUID()}.${ext}`;
      const url = await uploadImage(file.buffer, filename, file.mimetype);

      return res.json({ success: true, data: { url } });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
