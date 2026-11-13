import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { messageSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireApiUser();
    const conversations = await prisma.conversation.findMany({
      where: { participants: { some: { userId: user.id } } },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, avatar: true, role: true } } },
        },
        messages: {
          include: { sender: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return ok({ conversations });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const input = messageSchema.parse(await readJson(request));
    if (!input.userId && !input.conversationId) {
      return fail("Choose a conversation or recipient.", 422);
    }

    let conversationId = input.conversationId;
    if (!conversationId && input.userId) {
      if (input.userId === user.id) {
        return fail("You cannot message yourself.", 422);
      }
      const recipient = await prisma.user.findUnique({
        where: { id: input.userId },
        select: { id: true, status: true },
      });
      if (!recipient || recipient.status !== "ACTIVE") {
        return fail("Recipient not found.", 404);
      }

      const existing = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: user.id } } },
            { participants: { some: { userId: input.userId } } },
          ],
        },
        include: { participants: true },
      });
      const direct =
        existing && existing.participants.length === 2 ? existing : null;

      if (direct) {
        conversationId = direct.id;
      } else {
        const created = await prisma.conversation.create({
          data: {
            participants: {
              create: [{ userId: user.id }, { userId: input.userId }],
            },
          },
        });
        conversationId = created.id;
      }
    }

    if (!conversationId) return fail("Conversation not found.", 404);
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: { conversationId, userId: user.id },
      },
    });
    if (!participant) return fail("Conversation not found.", 404);

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        body: input.body,
      },
      include: { sender: { select: { id: true, name: true } } },
    });
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    const others = await prisma.conversationParticipant.findMany({
      where: { conversationId, userId: { not: user.id } },
      select: { userId: true },
    });
    await prisma.notification.createMany({
      data: others.map((other) => ({
        userId: other.userId,
        type: "MESSAGE",
        title: `New message from ${user.name}`,
        message: input.body.slice(0, 140),
        href: "/buyer/messages",
      })),
    });

    return ok({ message, conversationId }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
