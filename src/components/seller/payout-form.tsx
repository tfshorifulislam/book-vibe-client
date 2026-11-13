"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CircleDollarSign, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

export function PayoutForm({ availableBalance }: { availableBalance: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bKash Merchant");
  const [accountNumber, setAccountNumber] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount < 100) {
      toast.error("Minimum payout request is 100 BDT.");
      return;
    }
    if (parsedAmount > availableBalance) {
      toast.error(`Cannot withdraw more than available balance of ${formatPrice(availableBalance)}.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/seller/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          method: `${method} (${accountNumber})`,
          note: note || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message || "Failed to request payout.");
        setLoading(false);
        return;
      }

      toast.success("Payout request submitted for admin review.");
      setOpen(false);
      setAmount("");
      setAccountNumber("");
      setNote("");
      router.refresh();
    } catch {
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Available For Withdrawal
          </span>
          <p className="text-2xl font-bold text-foreground">{formatPrice(availableBalance)}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          disabled={availableBalance < 100}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:opacity-50"
        >
          <Plus className="size-4" /> Request Payout
        </button>
      </div>

      {open ? (
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <CircleDollarSign className="size-4 text-primary" />
            <h3 className="text-sm font-semibold">Request Balance Payout</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">Payout Amount (BDT) *</label>
              <input
                type="number"
                required
                min={100}
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">Payout Channel</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="bKash Merchant">bKash Merchant</option>
                <option value="Nagad Business">Nagad Business</option>
                <option value="City Bank Account">Bank Transfer (City Bank)</option>
                <option value="Brac Bank Account">Bank Transfer (BRAC Bank)</option>
                <option value="Islami Bank Account">Bank Transfer (Islami Bank)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">
                Account / Wallet Number *
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g. 01712345678 or Account No."
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">Note (optional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. November week 1 earnings"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
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
              {loading ? <Loader2 className="size-4 animate-spin" /> : null} Submit Request
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
