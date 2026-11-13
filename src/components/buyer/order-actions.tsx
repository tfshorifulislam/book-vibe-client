"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function cancel() {
    if (
      !window.confirm(
        "Cancel this order? Stock will be returned to the seller.",
      )
    )
      return;
    setPending(true);
    const response = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED", note: "Cancelled by buyer" }),
    });
    const payload = (await response.json()) as {
      success: boolean;
      message?: string;
    };
    setPending(false);
    if (!response.ok || !payload.success) {
      toast.error(payload.message ?? "Unable to cancel this order.");
      return;
    }
    toast.success("Order cancelled.");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={cancel}
      disabled={pending}
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-destructive/30 px-3 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"
    >
      {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
      Cancel order
    </button>
  );
}
