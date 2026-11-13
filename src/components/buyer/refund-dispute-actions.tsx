"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AlertCircle, Loader2, RotateCcw, ShieldAlert, X } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export function RefundRequestModal({
  orderId,
  orderTotal,
  existingRefund,
}: {
  orderId: string;
  orderTotal: number;
  existingRefund?: { status: string; amount: number; reason: string } | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState(orderTotal.toString());
  const [note, setNote] = useState("");

  if (existingRefund) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-lg bg-warning/15 px-3 py-1.5 text-xs font-semibold text-warning">
        <RotateCcw className="size-3.5" />
        <span>
          Refund {existingRefund.status} (
          {formatCurrency(existingRefund.amount)})
        </span>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount: Number(amount) || orderTotal,
          reason,
          note: note || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message || "Failed to submit refund request.");
        setLoading(false);
        return;
      }

      toast.success("Refund request submitted successfully.");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("An error occurred while submitting your refund request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
      >
        <RotateCcw className="size-3.5 text-warning" /> Request Refund
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200 fade-in">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <RotateCcw className="size-4 text-warning" />
                <span>Request Order Refund</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase">
                  Reason for Refund *
                </label>
                <select
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">Select a reason...</option>
                  <option value="Damaged or defective book received">
                    Damaged or defective book received
                  </option>
                  <option value="Wrong book edition or title received">
                    Wrong book edition or title received
                  </option>
                  <option value="Book condition did not match description">
                    Book condition did not match description
                  </option>
                  <option value="Missing pages or major printing error">
                    Missing pages or major printing error
                  </option>
                  <option value="Other return/refund reason">
                    Other return/refund reason
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase">
                  Requested Amount (BDT)
                </label>
                <input
                  type="number"
                  min={1}
                  max={orderTotal}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Maximum refundable amount for this order is{" "}
                  {formatCurrency(orderTotal)}.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase">
                  Additional Notes (optional)
                </label>
                <textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Provide additional details regarding the condition or issue..."
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !reason}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : null}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function DisputeRequestModal({
  orderId,
  existingDispute,
}: {
  orderId: string;
  existingDispute?: {
    status: string;
    reason: string;
    resolution?: string | null;
  } | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");

  if (existingDispute) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/15 px-3 py-1.5 text-xs font-semibold text-destructive">
        <AlertCircle className="size-3.5" />
        <span>Dispute {existingDispute.status}</span>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reason }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message || "Failed to open dispute.");
        setLoading(false);
        return;
      }

      toast.success("Dispute filed. Admin will arbitrate your case.");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("An error occurred while filing the dispute.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
      >
        <ShieldAlert className="size-3.5" /> Open Dispute
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-sm duration-200 fade-in">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 font-bold text-destructive">
                <ShieldAlert className="size-4" />
                <span>File Buyer Dispute</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <p className="text-xs text-muted-foreground">
                If the seller failed to deliver your book or refused a
                legitimate return, submit this claim for marketplace admin
                arbitration.
              </p>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase">
                  Dispute Details & Claim *
                </label>
                <textarea
                  required
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe what occurred with the order and your requested resolution..."
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-border pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || reason.trim().length < 5}
                  className="text-destructive-foreground inline-flex items-center gap-1.5 rounded-lg bg-destructive px-4 py-2 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : null}
                  File Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
