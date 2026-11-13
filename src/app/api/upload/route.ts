import { randomUUID } from "node:crypto";

import { fail, handleError, ok, requireApiUser } from "@/lib/api";
import { uploadImage } from "@/lib/storage";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

export async function POST(request: Request) {
  try {
    await requireApiUser(["buyer", "seller", "admin"]);
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) return fail("Choose an image to upload.", 422);
    if (file.size > MAX_SIZE) {
      return fail("Images must be smaller than 5 MB.", 413);
    }
    const extension = ALLOWED.get(file.type);
    if (!extension) {
      return fail("Please upload a JPG, PNG, WebP, or AVIF image.", 415);
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const filename = `${randomUUID()}.${extension}`;
    const url = await uploadImage(bytes, filename, file.type);

    return ok({ url });
  } catch (error) {
    return handleError(error);
  }
}
