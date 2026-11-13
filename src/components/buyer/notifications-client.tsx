"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  href: string | null;
  isRead: boolean;
  createdAt: string;
};

export function NotificationsClient({ initial }: { initial: Notification[] }) {
  const [items, setItems] = useState(initial);
  const [pending, setPending] = useState(false);
  const unread = items.filter((item) => !item.isRead).length;

  async function markAll() {
    setPending(true);
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setPending(false);
    if (!response.ok) {
      toast.error("Unable to update notifications.");
      return;
    }
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
  }

  async function markRead(id: string) {
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (response.ok) {
      setItems((current) => current.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
        <Bell className="mx-auto size-8 text-muted-foreground" />
        <h2 className="mt-2 text-base font-semibold">No notifications yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">Order updates and messages will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{unread} unread</p>
        {unread ? (
          <button type="button" onClick={markAll} disabled={pending} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline disabled:opacity-60">
            <CheckCheck className="size-4" /> Mark all as read
          </button>
        ) : null}
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {items.map((item) => {
          const content = (
            <div className={`flex gap-3 p-4 transition-colors hover:bg-muted/50 ${item.isRead ? "" : "bg-primary/[0.03]"}`}>
              <span className={`mt-1.5 size-2 shrink-0 rounded-full ${item.isRead ? "bg-transparent" : "bg-primary"}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{item.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            </div>
          );
          return (
            <li key={item.id}>
              {item.href ? (
                <Link href={item.href} onClick={() => markRead(item.id)}>{content}</Link>
              ) : (
                <button type="button" onClick={() => markRead(item.id)} className="block w-full text-left">{content}</button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
