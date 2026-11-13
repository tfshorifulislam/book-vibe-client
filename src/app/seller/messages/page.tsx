import type { Metadata } from "next";

import { MessagesClient } from "@/components/buyer/messages-client";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Messages | Seller Workspace" };

export default async function SellerMessagesPage() {
  const user = await requireRole("seller");
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

  const initial = conversations.map((c) => ({
    id: c.id,
    updatedAt: c.updatedAt.toISOString(),
    participants: c.participants,
    messages: c.messages.map((m) => ({
      id: m.id,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
      senderId: m.senderId,
      sender: { name: m.sender.name },
    })),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Communication"
        title="Buyer Messages"
        description="Real-time chat with customers inquiring about books and order tracking."
      />
      <MessagesClient initialConversations={initial} currentUserId={user.id} />
    </div>
  );
}
