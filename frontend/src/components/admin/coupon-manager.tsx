"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, Plus, Tag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

type Coupon = {
  id: string;
  code: string;
  description?: string | null;
  type: string;
  value: number;
  minOrder: number;
  maxDiscount?: number | null;
  isActive: boolean;
  shop?: { name: string } | null;
  _count?: { usages: number };
};

export function AdminCouponManager({ initial }: { initial: Coupon[] }) {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>(initial);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"FIXED" | "PERCENT" | "FREE_SHIPPING">(
    "PERCENT",
  );
  const [value, setValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          description: description || undefined,
          type,
          value: Number(value || 0),
          minOrder: Number(minOrder || 0),
          maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
          isActive: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message || "Failed to create coupon.");
        setLoading(false);
        return;
      }

      toast.success("Platform coupon created!");
      setCoupons([data.coupon, ...coupons]);
      setOpen(false);
      setCode("");
      setDescription("");
      setValue("");
      setMinOrder("");
      setMaxDiscount("");
      router.refresh();
    } catch {
      toast.error("Failed to create coupon.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Permanently delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCoupons(coupons.filter((c) => c.id !== id));
        toast.success("Coupon deleted.");
        router.refresh();
      } else {
        toast.error("Failed to delete coupon.");
      }
    } catch {
      toast.error("An error occurred.");
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
          <Plus className="size-4" /> Create Marketplace Coupon
        </button>
      </div>

      {open ? (
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Tag className="size-4 text-primary" /> Create New Coupon
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">
                Coupon Code *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. BOOKHAND20"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm font-bold text-foreground uppercase focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">
                Discount Type
              </label>
              <select
                value={type}
                onChange={(e) =>
                  setType(
                    e.target.value as "FIXED" | "PERCENT" | "FREE_SHIPPING",
                  )
                }
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="PERCENT">Percentage Discount (%)</option>
                <option value="FIXED">Fixed Amount (BDT)</option>
                <option value="FREE_SHIPPING">Free Shipping</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">
                {type === "PERCENT"
                  ? "Discount Percentage (%) *"
                  : "Discount Amount (BDT) *"}
              </label>
              <input
                type="number"
                required
                min={0}
                max={type === "PERCENT" ? 100 : 100000}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === "PERCENT" ? "20" : "150"}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">
                Minimum Order (BDT)
              </label>
              <input
                type="number"
                min={0}
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="500"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">
                Max Discount Cap (BDT)
              </label>
              <input
                type="number"
                min={0}
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="300"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Special nationwide promotional discount"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
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
              {loading ? <Loader2 className="size-4 animate-spin" /> : null}{" "}
              Save Coupon
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Min Order</th>
              <th className="px-4 py-3">Scope / Shop</th>
              <th className="px-4 py-3">Times Used</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No coupons created yet.
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono font-bold text-primary">
                    {c.code}
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {c.type === "PERCENT" || c.type === "PERCENTAGE"
                      ? `${c.value}% off`
                      : c.type === "FREE_SHIPPING"
                        ? "Free Shipping"
                        : `${formatCurrency(c.value)} off`}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {c.minOrder ? formatCurrency(c.minOrder) : "No minimum"}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {c.shop ? (
                      <span className="font-medium text-foreground">
                        {c.shop.name}
                      </span>
                    ) : (
                      <span className="font-semibold text-primary">
                        Marketplace-wide
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {c._count?.usages ?? 0} usages
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        c.isActive
                          ? "bg-success/15 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {c.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
                      title="Delete Coupon"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
