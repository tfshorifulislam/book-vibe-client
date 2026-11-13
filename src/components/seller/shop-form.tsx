"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, Store } from "lucide-react";
import { toast } from "sonner";

type ShopData = {
  name: string;
  slug: string;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  district?: string | null;
};

export function ShopForm({ initial }: { initial?: ShopData | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [city, setCity] = useState(initial?.city ?? "Dhaka");
  const [district, setDistrict] = useState(initial?.district ?? "Dhaka");

  function handleNameChange(val: string) {
    setName(val);
    if (!initial?.slug) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
      );
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/seller/shop", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          description: description || undefined,
          email: email || undefined,
          phone: phone || undefined,
          address: address || undefined,
          city: city || undefined,
          district: district || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message || "Failed to save shop profile.");
        setLoading(false);
        return;
      }

      toast.success("Shop profile saved successfully.");
      router.refresh();
      setLoading(false);
    } catch {
      toast.error("An error occurred while saving shop profile.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Store className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold">Bookstore Profile</h2>
            <p className="text-xs text-muted-foreground">Information displayed to customers on your public storefront.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">Shop Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Dhaka Heritage Books"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">Shop URL Handle (slug) *</label>
            <div className="mt-1 flex items-center rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground focus-within:ring-2 focus-within:ring-primary">
              <span className="text-xs">/shops/</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                className="w-full bg-transparent pl-1 text-foreground focus:outline-none text-sm"
                placeholder="dhaka-heritage"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Tell customers about your bookstore, curation focus, and specialty genres."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">Contact Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="books@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="+880 1712-345678"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-muted-foreground uppercase">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-muted-foreground uppercase">District</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-muted-foreground uppercase">Street / Area</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Nilkhet Book Market"
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
          Save Shop Profile
        </button>
      </div>
    </form>
  );
}
