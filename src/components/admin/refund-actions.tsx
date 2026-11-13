"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export function AdminRefundActions({ refundId }: { refundId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateRefund(status: "APPROVED" | "REJECTED") {
    if (!confirm(`Mark refund as ${status}?`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/refunds", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: refundId, status }),
      });

      if (!res.ok) {
        toast.error("Failed to update refund.");
        setLoading(false);
        return;
      }

      toast.success(`Refund marked as ${status}.`);
      router.refresh();
      setLoading(false);
    } catch {
      toast.error("An error occurred.");
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        disabled={loading}
        onClick={() => updateRefund("APPROVED")}
        className="inline-flex items-center gap-1 rounded bg-success/10 px-2.5 py-1 text-xs font-semibold text-success hover:bg-success/20 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Check className="size-3" />
        )}{" "}
        Approve Refund
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => updateRefund("REJECTED")}
        className="inline-flex items-center gap-1 rounded bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/20 disabled:opacity-50"
      >
        <X className="size-3" /> Reject
      </button>
    </div>
  );
}
