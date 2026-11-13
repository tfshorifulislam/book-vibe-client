"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { LoaderCircle, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

import { cn, getInitials } from "@/lib/utils";

type Participant = {
  user: { id: string; name: string; avatar: string | null; role: string };
};

type Conversation = {
  id: string;
  updatedAt: string;
  participants: Participant[];
  messages: { id: string; body: string; createdAt: string; senderId: string; sender: { name: string } }[];
};

type Message = {
  id: string;
  body: string;
  createdAt: string;
  senderId: string;
  sender: { id: string; name: string; avatar: string | null };
};

export function MessagesClient({
  initialConversations,
  currentUserId,
}: {
  initialConversations: Conversation[];
  currentUserId: string;
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState(initialConversations[0]?.id ?? "");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  function selectConversation(id: string) {
    setLoading(true);
    setSelectedId(id);
  }

  useEffect(() => {
    if (!selectedId) return;
    fetch(`/api/messages/${selectedId}`)
      .then((response) => response.json())
      .then((payload: { success?: boolean; data?: { conversation: { messages: Message[] } } }) => {
        if (payload.success) setMessages(payload.data?.conversation.messages ?? []);
      })
      .catch(() => toast.error("Unable to load this conversation."))
      .finally(() => setLoading(false));
  }, [selectedId]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(event: FormEvent) {
    event.preventDefault();
    if (!body.trim() || !selectedId) return;
    setSending(true);
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selectedId, body }),
    });
    const payload = (await response.json()) as { success: boolean; data?: { message: Message }; message?: string };
    setSending(false);
    if (!response.ok || !payload.success || !payload.data) {
      toast.error(payload.message ?? "Unable to send your message.");
      return;
    }
    setMessages((current) => [...current, payload.data!.message]);
    setBody("");
    setConversations((current) =>
      current.map((item) =>
        item.id === selectedId
          ? { ...item, messages: [{ ...payload.data!.message, sender: { name: payload.data!.message.sender.name } }], updatedAt: new Date().toISOString() }
          : item,
      ),
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
        <MessageCircle className="mx-auto size-8 text-muted-foreground" />
        <h2 className="mt-2 text-base font-semibold">No conversations yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">Message a seller from a book page to ask about an order.</p>
      </div>
    );
  }

  const selected = conversations.find((item) => item.id === selectedId);

  return (
    <div className="grid h-[640px] overflow-hidden rounded-xl border border-border bg-card md:grid-cols-[280px_1fr]">
      <aside className="hidden border-r border-border md:block">
        <div className="border-b border-border p-4"><h2 className="text-sm font-bold">Conversations</h2></div>
        <ul className="divide-y divide-border overflow-y-auto">
          {conversations.map((conversation) => {
            const other = conversation.participants.find((item) => item.user.id !== currentUserId)?.user;
            const last = conversation.messages[0];
            return (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => selectConversation(conversation.id)}
                  className={cn("flex w-full items-start gap-2.5 p-3 text-left hover:bg-muted/50", selectedId === conversation.id && "bg-primary/5")}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {other?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={other.avatar} alt="" className="size-9 rounded-full object-cover" />
                    ) : (
                      getInitials(other?.name ?? "?")
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{other?.name ?? "Conversation"}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">{last?.body ?? "No messages yet"}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="flex min-h-0 flex-col">
        <div className="flex h-14 items-center border-b border-border px-4">
          <div className="md:hidden">
            <select value={selectedId} onChange={(event) => selectConversation(event.target.value)} className="h-9 max-w-[220px] rounded-lg border border-input bg-background px-2 text-sm">
              {conversations.map((conversation) => {
                const other = conversation.participants.find((item) => item.user.id !== currentUserId)?.user;
                return <option key={conversation.id} value={conversation.id}>{other?.name ?? "Conversation"}</option>;
              })}
            </select>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold">{selected?.participants.find((item) => item.user.id !== currentUserId)?.user.name ?? "Conversation"}</p>
            <p className="text-xs text-muted-foreground">Direct message</p>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 p-4">
          {loading ? <div className="flex justify-center py-8"><LoaderCircle className="size-5 animate-spin text-muted-foreground" /></div> : null}
          {!loading && messages.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No messages yet. Say hello.</p> : null}
          {messages.map((message) => {
            const mine = message.senderId === currentUserId;
            return (
              <div key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2 text-sm", mine ? "rounded-br-sm bg-primary text-primary-foreground" : "rounded-bl-sm border border-border bg-card")}>
                  {!mine ? <p className="mb-0.5 text-[10px] font-semibold opacity-70">{message.sender.name}</p> : null}
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                  <p className={cn("mt-1 text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottom} />
        </div>

        <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
          <input value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a message…" className="h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary" />
          <button type="submit" disabled={sending || !body.trim()} className="inline-flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50" aria-label="Send message">
            {sending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </form>
      </section>
    </div>
  );
}
