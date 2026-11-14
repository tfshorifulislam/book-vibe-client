"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, Store, Upload, X } from "lucide-react";
import { toast } from "sonner";

import { uploadDirectToCloudinary } from "@/lib/upload";

type ShopData = {
  name: string;
  slug: string;
  logo?: string | null;
  banner?: string | null;
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
  const [logo, setLogo] = useState(initial?.logo ?? "");
  const [banner, setBanner] = useState(initial?.banner ?? "");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
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

  async function handleLogoUpload(file: File) {
    setUploadingLogo(true);
    try {
      const res = await uploadDirectToCloudinary(file, {
        entity: "shop_logo",
      });
      setLogo(res.url);
      toast.success("Shop logo updated.");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload shop logo.",
      );
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleBannerUpload(file: File) {
    setUploadingBanner(true);
    try {
      const res = await uploadDirectToCloudinary(file, {
        entity: "shop_banner",
      });
      setBanner(res.url);
      toast.success("Shop banner updated.");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload shop banner.",
      );
    } finally {
      setUploadingBanner(false);
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
          logo: logo || undefined,
          banner: banner || undefined,
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
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Store className="size-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold">Bookstore Profile</h2>
            <p className="text-xs text-muted-foreground">
              Information displayed to customers on your public storefront.
            </p>
          </div>
        </div>

        {/* Branding & Media */}
        <div className="grid gap-6 border-b border-border pb-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              Shop Logo
            </label>
            <div className="mt-2 flex items-center gap-4">
              {logo ? (
                <div className="relative size-16 overflow-hidden rounded-lg border border-border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logo}
                    alt="Shop logo preview"
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setLogo("")}
                    className="absolute top-1 right-1 rounded-full bg-background/80 p-0.5 text-foreground shadow hover:bg-background"
                    title="Remove logo"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : null}
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">
                {uploadingLogo ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {logo ? "Replace Logo" : "Upload Logo"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploadingLogo}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file);
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              Shop Banner
            </label>
            <div className="mt-2 flex items-center gap-4">
              {banner ? (
                <div className="relative h-16 w-32 overflow-hidden rounded-lg border border-border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner}
                    alt="Shop banner preview"
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setBanner("")}
                    className="absolute top-1 right-1 rounded-full bg-background/80 p-0.5 text-foreground shadow hover:bg-background"
                    title="Remove banner"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : null}
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">
                {uploadingBanner ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {banner ? "Replace Banner" : "Upload Banner"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploadingBanner}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleBannerUpload(file);
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              Shop Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="e.g. Dhaka Heritage Books"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              Shop URL Handle (slug) *
            </label>
            <div className="mt-1 flex items-center rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground focus-within:ring-2 focus-within:ring-primary">
              <span className="text-xs">/shops/</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  )
                }
                className="w-full bg-transparent pl-1 text-sm text-foreground focus:outline-none"
                placeholder="dhaka-heritage"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground uppercase">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            placeholder="Tell customers about your bookstore, curation focus, and specialty genres."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              Contact Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="books@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="+880 1712-345678"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              City
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              District
            </label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              Street / Area
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
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
