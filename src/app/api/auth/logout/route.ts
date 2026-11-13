import { handleError, ok } from "@/lib/api";
import { destroySession } from "@/lib/auth/session";

export async function POST() {
  try {
    await destroySession();
    return ok({ loggedOut: true });
  } catch (error) {
    return handleError(error);
  }
}
