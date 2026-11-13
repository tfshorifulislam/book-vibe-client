"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Star, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export function BookModerationActions({
  bookId,
  isFeatured,
  isActive,
}: {
  bookId: string;
  isFeatured: boolean;
  isActive: boolean;
}) {
  const router = useRouter();
  const [featured, setFeatured] = useState(isFeatured);
  const [active, setActive] = useState(isActive);
  const [loading, setLoading] = useState(false);

  async function handleUpdate(patch: { isFeatured?: boolean; isActive?: boolean }) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/books/${bookId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });

      if (!res.ok) {
        toast.error("Failed to update book.");
        setLoading(false);
        return;
      }

      if (patch.isFeatured !== undefined) setFeatured(patch.isFeatured);
      if (patch.isActive !== undefined) setActive(patch.isActive);

      toast.success("Book moderation updated.");
      router.refresh();
      setLoading(false);
    } catch {
      toast.error("An error occurred.");
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5 justify-end">
      <button
        type="button"
        disabled={loading}
        onClick={() => handleUpdate({ isFeatured: !featured })}
        className={`rounded p-1 text-xs transition-colors ${
          featured ? "text-amber-500 fill-amber-500 hover:bg-amber-500/10" : "text-muted-foreground hover:bg-muted"
        }`}
        title={featured ? "Remove from Featured" : "Mark as Featured"}
      >
        <Star className={`size-4 ${featured ? "fill-current" : ""}`} />
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={() => handleUpdate({ isActive: !active })}
        className={`rounded p-1 text-xs transition-colors ${
          active ? "text-destructive hover:bg-destructive/10" : "text-success hover:bg-success/10"
        }`}
        title={active ? "Unpublish / Suspend Book" : "Publish / Approve Book"}
      >
        {active ? <ShieldAlert className="size-4" /> : <ShieldCheck className="size-4" />}
      </button>
    </div>
  );
}
