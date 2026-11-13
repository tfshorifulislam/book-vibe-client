import { fail, handleError, ok, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ conversationId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireApiUser();
    const { conversationId } = await params;
    const participant = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId: user.id } },
    });
    if (!participant) return fail("Conversation not found.", 404);

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, role: true },
            },
          },
        },
        messages: {
          include: {
            sender: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!conversation) return fail("Conversation not found.", 404);

    await Promise.all([
      prisma.conversationParticipant.update({
        where: { id: participant.id },
        data: { lastReadAt: new Date() },
      }),
      prisma.message.updateMany({
        where: { conversationId, senderId: { not: user.id }, readAt: null },
        data: { readAt: new Date() },
      }),
    ]);

    return ok({ conversation });
  } catch (error) {
    return handleError(error);
  }
}
