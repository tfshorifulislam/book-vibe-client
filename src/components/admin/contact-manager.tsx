"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDateDisplay } from "@/lib/utils";

type ContactItem = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Date | string;
};

export function ContactMessageManager({
  initialMessages,
}: {
  initialMessages: ContactItem[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<ContactItem[]>(initialMessages);
  const [selectedMessage, setSelectedMessage] = useState<ContactItem | null>(null);

  async function updateStatus(id: string, status: "READ" | "REPLIED") {
    try {
      const res = await fetch(`/api/admin/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status } : m))
        );
        if (selectedMessage?.id === id) {
          setSelectedMessage((prev) => (prev ? { ...prev, status } : null));
        }
        toast.success(`Message marked as ${status}.`);
        router.refresh();
      } else {
        toast.error("Failed to update status.");
      }
    } catch {
      toast.error("An error occurred.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this inquiry?")) return;
    try {
      const res = await fetch(`/api/admin/contact/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selectedMessage?.id === id) setSelectedMessage(null);
        toast.success("Message deleted.");
        router.refresh();
      } else {
        toast.error("Failed to delete message.");
      }
    } catch {
      toast.error("An error occurred.");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Messages list */}
      <div className="lg:col-span-2 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Sender</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {messages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  <Mail className="mx-auto size-8 text-muted-foreground/50 mb-2" />
                  No customer contact inquiries yet.
                </td>
              </tr>
            ) : (
              messages.map((m) => (
                <tr
                  key={m.id}
                  onClick={() => {
                    setSelectedMessage(m);
                    if (m.status === "NEW") updateStatus(m.id, "READ");
                  }}
                  className={`cursor-pointer hover:bg-muted/30 transition-colors ${
                    selectedMessage?.id === m.id ? "bg-muted/50" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground text-xs">{m.name}</div>
                    <div className="text-[11px] text-muted-foreground">{m.email}</div>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="font-medium text-foreground text-xs truncate">{m.subject}</div>
                    <p className="text-[11px] text-muted-foreground truncate">{m.message}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        m.status === "NEW"
                          ? "bg-primary/15 text-primary"
                          : m.status === "REPLIED"
                          ? "bg-success/15 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateDisplay(m.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Pane */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4 h-fit">
        {selectedMessage ? (
          <>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-semibold text-foreground text-sm">{selectedMessage.subject}</h3>
                <div className="text-xs text-muted-foreground mt-0.5">
                  From: {selectedMessage.name} ({selectedMessage.email})
                </div>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  selectedMessage.status === "REPLIED"
                    ? "bg-success/15 text-success"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {selectedMessage.status}
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">
                Received Date
              </label>
              <p className="text-xs text-foreground mt-0.5">
                {formatDateDisplay(selectedMessage.createdAt, { includeTime: true })}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">
                Message Body
              </label>
              <div className="mt-1 rounded-lg bg-muted/40 p-3 text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                {selectedMessage.message}
              </div>
            </div>

            <div className="border-t border-border pt-4 flex items-center justify-between gap-2">
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(
                  selectedMessage.subject
                )}`}
                onClick={() => updateStatus(selectedMessage.id, "REPLIED")}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                <Mail className="size-3.5" /> Reply via Email
              </a>

              {selectedMessage.status !== "REPLIED" ? (
                <button
                  type="button"
                  onClick={() => updateStatus(selectedMessage.id, "REPLIED")}
                  className="inline-flex items-center gap-1 rounded border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                >
                  <Check className="size-3 text-success" /> Mark Replied
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-sm text-muted-foreground">
            Select an inquiry from the list to view its full message and details.
          </div>
        )}
      </div>
    </div>
  );
}
