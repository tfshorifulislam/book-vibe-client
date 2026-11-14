"use client";

import { useState, type FormEvent } from "react";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

export function QuestionResponder({ questionId }: { questionId: string }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [answered, setAnswered] = useState(false);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/answers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, body }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message || "Failed to submit answer.");
        setLoading(false);
        return;
      }

      toast.success("Answer posted successfully.");
      setAnswered(true);
      setOpen(false);
    } catch {
      toast.error("Failed to post answer.");
    } finally {
      setLoading(false);
    }
  }

  if (answered) {
    return (
      <span className="text-xs font-medium text-success">
        Answered just now
      </span>
    );
  }

  return (
    <div className="mt-2">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          <MessageSquare className="size-3.5" /> Reply to Customer
        </button>
      ) : (
        <form onSubmit={handleSend} className="mt-2 space-y-2">
          <textarea
            required
            rows={2}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type your official seller answer here..."
            className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1 rounded bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Send className="size-3" />
              )}{" "}
              Post Answer
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
