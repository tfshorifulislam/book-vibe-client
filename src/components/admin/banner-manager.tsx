"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Banner = {
  id: string;
  title: string;
  subtitle?: string | null;
  href?: string | null;
  order: number;
  isActive: boolean;
};

export function BannerManager({ initialBanners }: { initialBanners: Banner[] }) {
  const router = useRouter();
  const [banners, setBanners] = useState(initialBanners);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [href, setHref] = useState("");
  const [order, setOrder] = useState("0");

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle: subtitle || undefined,
          href: href || undefined,
          order: Number(order),
          isActive: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error("Failed to add banner.");
        setLoading(false);
        return;
      }

      toast.success("Banner added.");
      setBanners([...banners, data.banner]);
      setOpen(false);
      setTitle("");
      setSubtitle("");
      setHref("");
      setOrder("0");
      router.refresh();
    } catch {
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this banner?")) return;
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setBanners(banners.filter((b) => b.id !== id));
        toast.success("Banner deleted.");
        router.refresh();
      }
    } catch {
      toast.error("Failed to delete banner.");
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
          <Plus className="size-4" /> Add Promotional Banner
        </button>
      </div>

      {open ? (
        <form onSubmit={handleCreate} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-base font-semibold">New Promotional Banner</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">Headline *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Winter Book Festival - Up to 40% Off"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">Target Link URL</label>
              <input
                type="text"
                value={href}
                onChange={(e) => setHref(e.target.value)}
                placeholder="/deals or /categories/fiction"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">Subtitle / Callout</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Explore thousands of bestselling novels and academic titles."
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">Display Order</label>
              <input
                type="number"
                min={0}
                value={order}
                onChange={(e) => setOrder(e.target.value)}
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
              {loading ? <Loader2 className="size-4 animate-spin" /> : null} Save Banner
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {banners.length ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Headline</th>
                <th className="px-4 py-3">Subtitle</th>
                <th className="px-4 py-3">Link</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {banners.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-semibold text-foreground">{b.title}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{b.subtitle || "None"}</td>
                  <td className="px-4 py-3 text-xs font-mono text-primary">{b.href || "/"}</td>
                  <td className="px-4 py-3 text-xs">{b.order}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(b.id)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Delete banner"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">No promotional banners active.</div>
        )}
      </div>
    </div>
  );
}
