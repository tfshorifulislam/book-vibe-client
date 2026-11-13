"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function UserStatusToggle({
  userId,
  currentStatus,
}: {
  userId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

  async function handleToggle() {
    if (
      !confirm(
        `Are you sure you want to change user status to ${nextStatus}?`,
      )
    )
      return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message || "Failed to update user.");
        setLoading(false);
        return;
      }

      toast.success(`User is now ${nextStatus.toLowerCase()}.`);
      router.refresh();
      setLoading(false);
    } catch {
      toast.error("Failed to update status.");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleToggle}
      className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
        currentStatus === "ACTIVE"
          ? "text-destructive hover:bg-destructive/10"
          : "text-success hover:bg-success/10"
      }`}
    >
      {loading ? (
        <Loader2 className="size-3 animate-spin inline" />
      ) : currentStatus === "ACTIVE" ? (
        "Suspend"
      ) : (
        "Reactivate"
      )}
    </button>
  );
}
