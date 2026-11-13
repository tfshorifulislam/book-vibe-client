import { handleError, ok } from "@/lib/api";
import { getCategories } from "@/lib/data/books";

export async function GET() {
  try {
    return ok({ categories: await getCategories() });
  } catch (error) {
    return handleError(error);
  }
}
