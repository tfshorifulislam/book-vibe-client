import { handleError, ok, readJson } from "@/lib/api";
import { prisma } from "@/lib/db";
import { contactSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const input = contactSchema.parse(await readJson(request));
    const message = await prisma.contactMessage.create({ data: input });
    return ok(
      {
        id: message.id,
        message:
          "Thanks for contacting BookHand. Our support team will reply within one business day.",
      },
      { status: 201 },
    );
  } catch (error) {
    return handleError(error);
  }
}
