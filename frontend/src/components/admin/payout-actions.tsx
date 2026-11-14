"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export function AdminPayoutActions({ payoutId }: { payoutId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updatePayout(status: "PAID" | "REJECTED") {
    if (!confirm(`Mark payout as ${status}?`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: payoutId, status }),
      });

      if (!res.ok) {
        toast.error("Failed to update payout.");
        setLoading(false);
        return;
      }

      toast.success(`Payout marked as ${status}.`);
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
        onClick={() => updatePayout("PAID")}
        className="inline-flex items-center gap-1 rounded bg-success/10 px-2 py-1 text-xs font-semibold text-success hover:bg-success/20 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="size-3 animate-spin" />
        ) : (
          <Check className="size-3" />
        )}{" "}
        Approve & Pay
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => updatePayout("REJECTED")}
        className="inline-flex items-center gap-1 rounded bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/20 disabled:opacity-50"
      >
        <X className="size-3" /> Reject
      </button>
    </div>
  );
}
