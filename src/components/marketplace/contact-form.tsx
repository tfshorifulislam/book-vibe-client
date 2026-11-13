"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle, Send } from "lucide-react";
import { toast } from "sonner";

const field =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary";

export function ContactForm() {
  const [pending, setPending] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message }),
    });
    const payload = (await response.json()) as { success: boolean; data?: { message: string }; message?: string };
    setPending(false);
    if (!response.ok || !payload.success) {
      toast.error(payload.message ?? "Unable to send your message.");
      return;
    }
    toast.success(payload.data?.message ?? "Message sent.");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-border bg-card p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1 block text-xs font-medium">Name</label>
          <input id="contact-name" required value={name} onChange={(event) => setName(event.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1 block text-xs font-medium">Email</label>
          <input id="contact-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={field} />
        </div>
      </div>
      <div>
        <label htmlFor="contact-subject" className="mb-1 block text-xs font-medium">Subject</label>
        <input id="contact-subject" required value={subject} onChange={(event) => setSubject(event.target.value)} className={field} />
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1 block text-xs font-medium">Message</label>
        <textarea id="contact-message" required minLength={10} rows={5} value={message} onChange={(event) => setMessage(event.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
      </div>
      <button type="submit" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
        Send message
      </button>
    </form>
  );
}
