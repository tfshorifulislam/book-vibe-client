import { z } from "zod";

import { handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { validateCoupon } from "@/lib/commerce";

const schema = z.object({
  code: z.string().trim().min(1),
  subtotal: z.coerce.number().int().min(0),
});

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = schema.parse(await readJson(request));
    const result = await validateCoupon(input.code, user.id, input.subtotal);
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
