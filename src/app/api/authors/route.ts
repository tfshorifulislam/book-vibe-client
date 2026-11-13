import { handleError, ok } from "@/lib/api";
import { getAuthors } from "@/lib/data/books";

export async function GET() {
  try {
    return ok({ authors: await getAuthors() });
  } catch (error) {
    return handleError(error);
  }
}
