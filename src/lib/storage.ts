import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function uploadImage(
  bytes: Buffer,
  filename: string,
  mimeType: string,
): Promise<string> {
  const cloudinaryCloud = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
  const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudinaryCloud && cloudinaryApiKey && cloudinarySecret) {
    try {
      const base64 = `data:${mimeType};base64,${bytes.toString("base64")}`;
      const timestamp = Math.round(Date.now() / 1000).toString();

      const formData = new URLSearchParams();
      formData.append("file", base64);
      formData.append("timestamp", timestamp);
      formData.append("api_key", cloudinaryApiKey);

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
      console.warn(
        "[Storage] Cloudinary upload returned error, falling back to local:",
        data,
      );
    } catch (err) {
      console.warn(
        "[Storage] Cloudinary upload failed, falling back to local storage:",
        err,
      );
    }
  }

  // Local storage fallback (preserves all local uploads seamlessly)
  const directory = path.join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), bytes);

  return `/uploads/${filename}`;
}
