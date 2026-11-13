import { MessageCircle } from "lucide-react";

import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/session";
import { ContactMessageManager } from "@/components/admin/contact-manager";

export default async function AdminContactPage() {
  await requireRole("admin");

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Customer Inquiries
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and respond to messages submitted via the public Contact Us
            page.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
          <MessageCircle className="size-4 text-primary" />
          <span>
            Total Inquiries:{" "}
            <strong className="text-foreground">{messages.length}</strong>
          </span>
        </div>
      </div>

      <ContactMessageManager initialMessages={messages} />
    </div>
  );
}
