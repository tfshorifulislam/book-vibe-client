"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function OrderStatusUpdater({
  orderId,
  currentStatus,
  apiPrefix = "/api/seller/orders",
}: {
  orderId: string;
  currentStatus: string;
  apiPrefix?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("Steadfast Courier");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdate() {
    setLoading(true);
    try {
      const res = await fetch(`${apiPrefix}/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          trackingNumber: trackingNumber || undefined,
          carrier: carrier || undefined,
          note: note || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message || "Failed to update order status.");
        setLoading(false);
        return;
      }

      toast.success("Order status updated.");
      router.refresh();
      setLoading(false);
    } catch {
      toast.error("Failed to update status.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground">
        Update Order Status
      </h3>

      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing / Packing</option>
          <option value="SHIPPED">Shipped (In Transit)</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {status === "SHIPPED" ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              Carrier
            </label>
            <input
              type="text"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              Tracking Number
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. STF-827192"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
      ) : null}

      <div>
        <label className="block text-xs font-medium text-muted-foreground uppercase">
          Internal Note (optional)
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Dispatched parcel with bubble wrap."
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={handleUpdate}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:opacity-60"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
        Apply Status Change
      </button>
    </div>
  );
}
