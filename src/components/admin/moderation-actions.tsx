"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

export function ModerationButton({
  type,
  id,
  action,
  resolution,
}: {
  type: "review" | "question" | "dispute";
  id: string;
  action: "approve" | "reject" | "delete" | "resolve";
  resolution?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAction() {
    if (action === "delete" && !confirm("Permanently delete this entry?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/moderation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id, action, resolution }),
      });

      if (!res.ok) {
        toast.error("Failed to perform moderation action.");
        setLoading(false);
        return;
      }

      toast.success(`Action "${action}" completed.`);
      router.refresh();
      setLoading(false);
    } catch {
      toast.error("An error occurred.");
      setLoading(false);
    }
  }

  if (action === "approve") {
    return (
      <button
        type="button"
        disabled={loading}
        onClick={handleAction}
        className="inline-flex items-center gap-1 rounded bg-success/10 px-2 py-1 text-xs font-semibold text-success hover:bg-success/20 disabled:opacity-50"
      >
        {loading ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />} Approve
      </button>
    );
  }

  if (action === "reject") {
    return (
      <button
        type="button"
        disabled={loading}
        onClick={handleAction}
        className="inline-flex items-center gap-1 rounded bg-warning/15 px-2 py-1 text-xs font-semibold text-warning hover:bg-warning/25 disabled:opacity-50"
      >
        {loading ? <Loader2 className="size-3 animate-spin" /> : <X className="size-3" />} Reject
      </button>
    );
  }

  if (action === "resolve") {
    return (
      <button
        type="button"
        disabled={loading}
        onClick={handleAction}
        className="inline-flex items-center gap-1 rounded bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {loading ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />} Resolve
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleAction}
      className="rounded p-1 text-muted-foreground hover:text-destructive disabled:opacity-50"
      title="Delete"
    >
      {loading ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3.5" />}
    </button>
  );
}
