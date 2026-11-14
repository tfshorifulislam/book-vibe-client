import type { Metadata } from "next";

import { MessagesClient } from "@/components/buyer/messages-client";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage() {
  const user = await requireRole("buyer");
  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: user.id } } },
    include: {
      participants: {
        include: {
          user: { select: { id: true, name: true, avatar: true, role: true } },
        },
      },
      messages: {
        include: { sender: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
  const initial = conversations.map((conversation) => ({
    id: conversation.id,
    updatedAt: conversation.updatedAt.toISOString(),
    participants: conversation.participants,
    messages: conversation.messages.map((message) => ({
      id: message.id,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
      senderId: message.senderId,
      sender: { name: message.sender.name },
    })),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Messages"
        description="Conversations with sellers and support."
      />
      <MessagesClient initialConversations={initial} currentUserId={user.id} />
    </div>
  );
}
