import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { answerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = answerSchema.parse(await readJson(request));
    const question = await prisma.question.findUnique({
      where: { id: input.questionId },
      include: {
        user: { select: { id: true } },
        book: {
          select: {
            title: true,
            shop: { select: { ownerId: true } },
          },
        },
      },
    });
    if (!question) return fail("Question not found.", 404);
    if (
      user.role !== "admin" &&
      question.book.shop.ownerId !== user.id &&
      question.user.id !== user.id
    ) {
      return fail("You cannot answer this question.", 403);
    }

    const answer = await prisma.answer.create({
      data: {
        questionId: question.id,
        userId: user.id,
        body: input.body,
      },
      include: { user: { select: { name: true, role: true } } },
    });

    if (question.user.id !== user.id) {
      await prisma.notification.create({
        data: {
          userId: question.user.id,
          type: "QUESTION",
          title: "Your question was answered",
          message: `${user.name} answered your question about ${question.book.title}.`,
          href: "/buyer/questions",
        },
      });
    }

    return ok({ answer }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
