import { handleError, ok } from "@/lib/api";
import { getShops } from "@/lib/data/books";

export async function GET() {
  try {
    return ok({ shops: await getShops() });
  } catch (error) {
    return handleError(error);
  }
}
