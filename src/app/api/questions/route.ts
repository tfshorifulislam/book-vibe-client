import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { questionSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = questionSchema.parse(await readJson(request));
    const book = await prisma.book.findFirst({
      where: { id: input.bookId, isActive: true },
      include: { shop: { select: { ownerId: true } } },
    });
    if (!book) return fail("Book not found.", 404);

    const question = await prisma.question.create({
      data: { bookId: book.id, userId: user.id, body: input.body },
    });

    await prisma.notification.create({
      data: {
        userId: book.shop.ownerId,
        type: "QUESTION",
        title: "New buyer question",
        message: `${user.name} asked a question about ${book.title}.`,
        href: "/seller/questions",
      },
    });

    return ok({ question }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
