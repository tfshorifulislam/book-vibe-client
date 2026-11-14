export interface DirectUploadResult {
  url: string;
  publicId: string;
}

export interface DirectUploadOptions {
  folder?: string;
  entity?:
    "avatar" | "book" | "shop_logo" | "shop_banner" | "banner" | "general";
  entityId?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit

/**
 * Uploads an image directly from the browser to Cloudinary using backend-generated signatures.
 * No file binaries ever pass through or get saved on the application server.
 */
export async function uploadDirectToCloudinary(
  file: File,
  options: DirectUploadOptions = {},
): Promise<DirectUploadResult> {
  // 1. Client-side validation: file type
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error("Please upload a JPG, PNG, WebP, or AVIF image.");
  }

  // 2. Client-side validation: file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("File exceeds the 5MB size limit.");
  }

  // 3. Request secure upload signature from backend
  const signRes = await fetch("/api/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      folder: options.folder || "bookhand",
    }),
  });

  const signJson = await signRes.json();
  if (!signRes.ok || !signJson.success || !signJson.data) {
    throw new Error(
      signJson.message || "Failed to obtain Cloudinary upload authorization.",
    );
  }

  const { uploadUrl, apiKey, timestamp, folder, signature } = signJson.data;

  // 4. Direct upload from browser to Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("folder", folder);
  formData.append("signature", signature);

  const cloudRes = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  const cloudData = await cloudRes.json();
  if (!cloudRes.ok || !cloudData.secure_url || !cloudData.public_id) {
    throw new Error(
      cloudData.error?.message || "Direct Cloudinary upload failed.",
    );
  }

  // 5. Send verified secure_url and public_id to backend for validation and database persistence
  const confirmRes = await fetch("/api/upload/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secureUrl: cloudData.secure_url,
      publicId: cloudData.public_id,
      entity: options.entity || "general",
      entityId: options.entityId,
    }),
  });

  const confirmJson = await confirmRes.json();
  if (!confirmRes.ok || !confirmJson.success || !confirmJson.data) {
    throw new Error(
      confirmJson.message || "Failed to verify and save uploaded asset.",
    );
  }

  return {
    url: confirmJson.data.url,
    publicId: confirmJson.data.publicId,
  };
}

/**
 * Requests authorized deletion of a Cloudinary asset via the backend.
 */
export async function deleteCloudinaryAsset(
  urlOrPublicId: string,
): Promise<boolean> {
  const res = await fetch("/api/upload", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target: urlOrPublicId }),
  });

  const data = await res.json();
  return res.ok && data.success === true;
}
