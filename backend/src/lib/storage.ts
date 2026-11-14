import "server-only";

import { createHash } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export function generateCloudinarySignature(
  params: Record<string, string>,
  apiSecret: string,
): string {
  const sortedKeys = Object.keys(params).sort();
  const serialized = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");
  return createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

export function extractCloudinaryPublicId(urlOrId: string): string | null {
  if (!urlOrId || typeof urlOrId !== "string") return null;

  // If already a public ID path (e.g. "bookhand/photo" or "photo")
  if (
    !urlOrId.startsWith("http://") &&
    !urlOrId.startsWith("https://") &&
    !urlOrId.startsWith("/")
  ) {
    return urlOrId.replace(/\.[a-zA-Z0-9]+$/, "");
  }

  // Extract from Cloudinary URL: .../image/upload/(v12345/)?(bookhand/abc12345).ext
  const match = urlOrId.match(/\/image\/upload\/(?:v\d+\/)?([^\.\?#]+)/);
  if (match) {
    return decodeURIComponent(match[1]);
  }

  return null;
}

export async function uploadImage(
  bytes: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  const cloudinaryCloud = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
  const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;
  const isProduction = process.env.NODE_ENV === "production";
  const allowLocalFallback =
    !isProduction || process.env.STORAGE_FALLBACK_TO_LOCAL === "true";

  if (cloudinaryCloud && cloudinaryApiKey && cloudinarySecret) {
    try {
      const base64 = `data:${mimeType};base64,${bytes.toString("base64")}`;
      const timestamp = Math.round(Date.now() / 1000).toString();
      const folder = "bookhand";

      const paramsToSign: Record<string, string> = {
        folder,
        timestamp,
      };

      const signature = generateCloudinarySignature(
        paramsToSign,
        cloudinarySecret,
      );

      const formData = new URLSearchParams();
      formData.append("file", base64);
      formData.append("api_key", cloudinaryApiKey);
      formData.append("timestamp", timestamp);
      formData.append("folder", folder);
      formData.append("signature", signature);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloud}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json();
      if (res.ok && data.secure_url) {
        return data.secure_url;
      }

      const errorMessage =
        data.error?.message || "Cloudinary rejected image upload";
      console.warn(`[Storage] Cloudinary API error: ${errorMessage}`);

      if (!allowLocalFallback) {
        throw new Error(
          `Cloudinary upload failed in production: ${errorMessage}`,
        );
      }
    } catch (err) {
      if (!allowLocalFallback) {
        throw err instanceof Error
          ? err
          : new Error("Cloudinary upload failed in production");
      }
      console.warn(
        "[Storage] Cloudinary upload exception, falling back to local storage:",
        err instanceof Error ? err.message : err,
      );
    }
  } else if (!allowLocalFallback) {
    throw new Error(
      "Cloudinary credentials missing in production environment. Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  // Local storage fallback (preserves all local uploads in development)
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), bytes);

  return `/uploads/${filename}`;
}

export async function deleteImage(publicIdOrUrl: string): Promise<boolean> {
  const cloudinaryCloud = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
  const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;
  const isProduction = process.env.NODE_ENV === "production";
  const publicId = extractCloudinaryPublicId(publicIdOrUrl);

  if (publicId && cloudinaryCloud && cloudinaryApiKey && cloudinarySecret) {
    try {
      const timestamp = Math.round(Date.now() / 1000).toString();
      const paramsToSign: Record<string, string> = {
        public_id: publicId,
        timestamp,
      };

      const signature = generateCloudinarySignature(
        paramsToSign,
        cloudinarySecret,
      );

      const formData = new URLSearchParams();
      formData.append("public_id", publicId);
      formData.append("api_key", cloudinaryApiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloud}/image/destroy`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json();
      if (res.ok && (data.result === "ok" || data.result === "not found")) {
        return true;
      }

      const errorMessage =
        data.error?.message || data.result || "Cloudinary rejection";
      console.warn(`[Storage] Cloudinary delete failed: ${errorMessage}`);

      if (isProduction) {
        throw new Error(
          `Cloudinary delete failed in production: ${errorMessage}`,
        );
      }
      return false;
    } catch (err) {
      if (isProduction) {
        throw err instanceof Error
          ? err
          : new Error("Cloudinary delete failed in production");
      }
      console.warn("[Storage] Cloudinary delete exception:", err);
      return false;
    }
  }

  // Local storage deletion fallback
  const filename = path.basename(publicIdOrUrl);
  const localPath = path.join(process.cwd(), "public", "uploads", filename);
  try {
    await unlink(localPath);
    return true;
  } catch {
    return false;
  }
}
