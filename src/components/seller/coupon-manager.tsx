"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

type Coupon = {
  id: string;
  code: string;
  description?: string | null;
  type: string;
  value: number;
  minOrder?: number | null;
  maxDiscount?: number | null;
  expiresAt?: string | null;
  isActive: boolean;
  _count?: { usages: number };
};

export function CouponManager({ initial }: { initial: Coupon[] }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initial);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/seller/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          description: description || undefined,
          discountType,
          discountValue: Number(discountValue),
          minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
          maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message || "Failed to create coupon.");
        setLoading(false);
        return;
      }

      toast.success("Coupon created successfully.");
      const created = {
        ...data.coupon,
        type: data.coupon.type ?? discountType,
        value: data.coupon.value ?? Number(discountValue),
        minOrder: data.coupon.minOrder ?? Number(minOrderAmount || 0),
      };
      setCoupons([created, ...coupons]);
      setOpen(false);
      setCode("");
      setDescription("");
      setDiscountValue("");
      setMinOrderAmount("");
      setMaxDiscount("");
      setExpiresAt("");
      router.refresh();
    } catch {
      toast.error("Failed to create coupon.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to remove this coupon?")) return;
    try {
      const res = await fetch(`/api/seller/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons(coupons.filter((c) => c.id !== id));
        toast.success("Coupon removed.");
      }
    } catch {
      toast.error("Failed to delete coupon.");
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
          <Plus className="size-4" /> Create Coupon
        </button>
      </div>

      {open ? (
        <form onSubmit={handleCreate} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-base font-semibold">New Shop Coupon</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">Coupon Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. SUMMER15"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary uppercase font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as "PERCENTAGE" | "FIXED")}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (BDT)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">
                {discountType === "PERCENTAGE" ? "Discount Percentage (%) *" : "Discount Amount (BDT) *"}
              </label>
              <input
                type="number"
                required
                min={1}
                max={discountType === "PERCENTAGE" ? 100 : 10000}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={discountType === "PERCENTAGE" ? "15" : "100"}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">Min Order Amount (BDT)</label>
              <input
                type="number"
                min={0}
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">Max Discount Cap (BDT)</label>
              <input
                type="number"
                min={0}
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="200"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="15% discount on all books"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">Expiration Date</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
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
              {loading ? <Loader2 className="size-4 animate-spin" /> : null} Save Coupon
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {coupons.length ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Condition</th>
                <th className="px-4 py-3">Used</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-bold text-primary">{c.code}</td>
                  <td className="px-4 py-3 font-medium">
                    {c.type === "PERCENTAGE" ? `${c.value}% off` : `${formatPrice(c.value)} off`}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {c.minOrder ? `Min ${formatPrice(c.minOrder)}` : "No min"}
                  </td>
                  <td className="px-4 py-3 text-xs">{c._count?.usages ?? 0} times</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Delete coupon"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No coupons created yet. Create discounts to drive more sales for your shop.
          </div>
        )}
      </div>
    </div>
  );
}
