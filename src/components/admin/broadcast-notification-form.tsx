"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Bell, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

export function BroadcastNotificationForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"SYSTEM" | "PROMO" | "ALERT">("SYSTEM");
  const [targetRole, setTargetRole] = useState<"ALL" | "BUYER" | "SELLER">("ALL");
  const [href, setHref] = useState("");

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          type,
          targetRole,
          href: href || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message || "Failed to broadcast notification.");
        setLoading(false);
        return;
      }

      toast.success(`Broadcast delivered to ${data.sentCount} user(s)!`);
      setOpen(false);
      setTitle("");
      setMessage("");
      setHref("");
      router.refresh();
    } catch {
      toast.error("Failed to send notification.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90"
        >
          <Bell className="size-4" /> Broadcast Notification
        </button>
      </div>

      {open ? (
        <form onSubmit={handleSend} className="mt-4 rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Send className="size-4 text-primary" /> Send Broadcast Announcement
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground uppercase">Notification Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Platform Maintenance Notice / New Arrivals"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">Target Audience</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as "ALL" | "BUYER" | "SELLER")}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ALL">All Users (Buyers & Sellers)</option>
                <option value="BUYER">Buyers Only</option>
                <option value="SELLER">Sellers Only</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">Type / Priority</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "SYSTEM" | "PROMO" | "ALERT")}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="SYSTEM">System Notice</option>
                <option value="PROMO">Promotional</option>
                <option value="ALERT">Urgent Alert</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">Link / Destination (optional)</label>
              <input
                type="text"
                value={href}
                onChange={(e) => setHref(e.target.value)}
                placeholder="e.g. /books or /deals"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">Message Content *</label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write the notification body here..."
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : null} Broadcast Now
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
