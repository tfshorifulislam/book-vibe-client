"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, Settings } from "lucide-react";
import { toast } from "sonner";

export function AdminSettingsForm({
  initialSettings,
}: {
  initialSettings: Record<string, string>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [commission, setCommission] = useState(
    initialSettings["commission_rate"] ?? "10",
  );
  const [shippingDhaka, setShippingDhaka] = useState(
    initialSettings["shipping_dhaka"] ?? "60",
  );
  const [shippingOutside, setShippingOutside] = useState(
    initialSettings["shipping_outside"] ?? "120",
  );
  const [codEnabled, setCodEnabled] = useState(
    initialSettings["cod_enabled"] ?? "true",
  );
  const [bkashEnabled, setBkashEnabled] = useState(
    initialSettings["bkash_enabled"] ?? "true",
  );
  const [supportEmail, setSupportEmail] = useState(
    initialSettings["support_email"] ?? "support@bookhand.com",
  );
  const [supportPhone, setSupportPhone] = useState(
    initialSettings["support_phone"] ?? "+880 1700-000000",
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commission_rate: commission,
          shipping_dhaka: shippingDhaka,
          shipping_outside: shippingOutside,
          cod_enabled: codEnabled,
          bkash_enabled: bkashEnabled,
          support_email: supportEmail,
          support_phone: supportPhone,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to update platform settings.");
        setLoading(false);
        return;
      }

      toast.success("Platform settings updated successfully.");
      router.refresh();
      setLoading(false);
    } catch {
      toast.error("An error occurred.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Financial & Commission */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Settings className="size-4" /> Marketplace Commission
          </h2>
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              Platform Fee (%) *
            </label>
            <input
              type="number"
              min={0}
              max={50}
              required
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Standard commission deducted from seller orders upon delivery.
            </p>
          </div>
        </div>

        {/* Shipping Rates */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Delivery Rates</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">
                Inside Dhaka (BDT) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={shippingDhaka}
                onChange={(e) => setShippingDhaka(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">
                Outside Dhaka (BDT) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={shippingOutside}
                onChange={(e) => setShippingOutside(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateways */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Payment Channels</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={codEnabled === "true"}
                onChange={(e) =>
                  setCodEnabled(e.target.checked ? "true" : "false")
                }
                className="size-4 rounded border-border text-primary focus:ring-primary"
              />
              <span>Cash on Delivery (COD)</span>
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={bkashEnabled === "true"}
                onChange={(e) =>
                  setBkashEnabled(e.target.checked ? "true" : "false")
                }
                className="size-4 rounded border-border text-primary focus:ring-primary"
              />
              <span>bKash Online Payment</span>
            </label>
          </div>
        </div>

        {/* Support & Contact */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Support Coordinates</h2>
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              Support Email
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              Helpdesk Hotline
            </label>
            <input
              type="text"
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          Save Platform Settings
        </button>
      </div>
    </form>
  );
}
