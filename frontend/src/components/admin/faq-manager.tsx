"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  order: number;
};

export function FaqManager({ initialFaqs }: { initialFaqs: FaqItem[] }) {
  const router = useRouter();
  const [faqs, setFaqs] = useState(initialFaqs);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [order, setOrder] = useState("0");

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          answer,
          order: Number(order),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Failed to add FAQ.");
        setLoading(false);
        return;
      }

      toast.success("FAQ entry saved.");
      setFaqs([...faqs, data.faq]);
      setOpen(false);
      setQuestion("");
      setAnswer("");
      setOrder("0");
      router.refresh();
    } catch {
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this FAQ entry?")) return;
    try {
      const res = await fetch(`/api/admin/faqs?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setFaqs(faqs.filter((f) => f.id !== id));
        toast.success("FAQ deleted.");
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete FAQ.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90"
        >
          <Plus className="size-4" /> Add FAQ Entry
        </button>
      </div>

      {open ? (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-xl border border-border bg-card p-5"
        >
          <h3 className="text-base font-semibold">New FAQ Entry</h3>
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              Question *
            </label>
            <input
              type="text"
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. How does delivery work across Bangladesh?"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              Answer *
            </label>
            <textarea
              required
              rows={3}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Provide a helpful, clear answer for customers."
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="w-32">
              <label className="block text-xs font-medium text-muted-foreground uppercase">
                Order
              </label>
              <input
                type="number"
                min={0}
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
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
                {loading ? <Loader2 className="size-4 animate-spin" /> : null}{" "}
                Save FAQ
              </button>
            </div>
          </div>
        </form>
      ) : null}

      <div className="space-y-3">
        {faqs.map((f) => (
          <div
            key={f.id}
            className="space-y-2 rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-sm font-semibold text-foreground">
                {f.question}
              </h3>
              <button
                type="button"
                onClick={() => handleDelete(f.id)}
                className="shrink-0 text-muted-foreground hover:text-destructive"
                title="Delete FAQ"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {f.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
