import "server-only";

import { createHash } from "node:crypto";

export interface CloudinarySignatureData {
  cloudName: string;
  apiKey: string;
  timestamp: string;
  folder: string;
  signature: string;
  uploadUrl: string;
}

export function generateCloudinarySignature(
  params: Record<string, string>,
  apiSecret: string,
): string {
  const sortedKeys = Object.keys(params).sort();
  const serialized = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");
  return createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

export function createUploadSignature(
  folder = "bookhand",
): CloudinarySignatureData {
  const cloudinaryCloud = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
  const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudinaryCloud || !cloudinaryApiKey || !cloudinarySecret) {
    throw new Error(
      "Cloudinary credentials missing. Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  // Sanitize folder to prevent arbitrary directory path traversal
  const sanitizedFolder = folder
    .replace(/[^a-zA-Z0-9_\-\/]/g, "")
    .slice(0, 100);
  const targetFolder = sanitizedFolder.startsWith("bookhand")
    ? sanitizedFolder
    : `bookhand/${sanitizedFolder}`;

  const timestamp = Math.round(Date.now() / 1000).toString();
  const paramsToSign: Record<string, string> = {
    folder: targetFolder,
    timestamp,
  };

  const signature = generateCloudinarySignature(paramsToSign, cloudinarySecret);

  return {
    cloudName: cloudinaryCloud,
    apiKey: cloudinaryApiKey,
    timestamp,
    folder: targetFolder,
    signature,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudinaryCloud}/image/upload`,
  };
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

export function validateCloudinaryAssetUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  const cloudinaryCloud = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudinaryCloud) return false;

  // Cloudinary secure URL pattern for this cloud
  const prefix = `https://res.cloudinary.com/${cloudinaryCloud}/image/upload/`;
  if (!url.startsWith(prefix)) return false;

  const publicId = extractCloudinaryPublicId(url);
  if (!publicId || !publicId.startsWith("bookhand")) return false;

  return true;
}

export async function verifyCloudinaryAsset(url: string): Promise<boolean> {
  if (!validateCloudinaryAssetUrl(url)) return false;

  try {
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) return false;
    const contentType = res.headers.get("content-type");
    return !!contentType && contentType.startsWith("image/");
  } catch {
    return false;
  }
}

export async function uploadImage(
  bytes: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  const cloudinaryCloud = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
  const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudinaryCloud || !cloudinaryApiKey || !cloudinarySecret) {
    throw new Error(
      "Cloudinary credentials missing. Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  const base64 = `data:${mimeType};base64,${bytes.toString("base64")}`;
  const timestamp = Math.round(Date.now() / 1000).toString();
  const folder = "bookhand";

  const paramsToSign: Record<string, string> = {
    folder,
    timestamp,
  };

  const signature = generateCloudinarySignature(paramsToSign, cloudinarySecret);

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
  throw new Error(`Cloudinary direct upload failed: ${errorMessage}`);
}

export async function deleteImage(publicIdOrUrl: string): Promise<boolean> {
  const cloudinaryCloud = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
  const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;
  const publicId = extractCloudinaryPublicId(publicIdOrUrl);

  if (!publicId) return false;

  if (!cloudinaryCloud || !cloudinaryApiKey || !cloudinarySecret) {
    throw new Error("Cloudinary credentials missing for asset deletion.");
  }

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
    return false;
  } catch (err) {
    console.warn("[Storage] Cloudinary delete exception:", err);
    return false;
  }
}
