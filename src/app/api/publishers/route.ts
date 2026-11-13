import { handleError, ok } from "@/lib/api";
import { getPublishers } from "@/lib/data/books";

export async function GET() {
  try {
    return ok({ publishers: await getPublishers() });
  } catch (error) {
    return handleError(error);
  }
}
