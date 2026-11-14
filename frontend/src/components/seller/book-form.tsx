"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type Option = { id: string; name: string };

type BookFormProps = {
  initial?: {
    id: string;
    title: string;
    slug: string;
    description: string;
    authorId: string;
    categoryId: string;
    publisherId: string | null;
    isbn: string | null;
    language: string;
    edition: string | null;
    pageCount: number | null;
    coverTone: number;
    condition: string;
    listingType: string;
    price: number;
    originalPrice: number | null;
    stock: number;
    lowStockAlert: number;
  };
  authors: Option[];
  categories: Option[];
  publishers: Option[];
};

export function BookForm({
  initial,
  authors,
  categories,
  publishers,
}: BookFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [authorId, setAuthorId] = useState(
    initial?.authorId ?? (authors[0]?.id || ""),
  );
  const [categoryId, setCategoryId] = useState(
    initial?.categoryId ?? (categories[0]?.id || ""),
  );
  const [publisherId, setPublisherId] = useState(initial?.publisherId ?? "");
  const [price, setPrice] = useState(initial?.price?.toString() ?? "");
  const [originalPrice, setOriginalPrice] = useState(
    initial?.originalPrice?.toString() ?? "",
  );
  const [stock, setStock] = useState(initial?.stock?.toString() ?? "5");
  const [lowStockAlert, setLowStockAlert] = useState(
    initial?.lowStockAlert?.toString() ?? "2",
  );
  const [condition, setCondition] = useState(initial?.condition ?? "NEW");
  const [listingType, setListingType] = useState(initial?.listingType ?? "NEW");
  const [coverTone, setCoverTone] = useState(initial?.coverTone ?? 1);
  const [isbn, setIsbn] = useState(initial?.isbn ?? "");
  const [language, setLanguage] = useState(initial?.language ?? "English");
  const [edition, setEdition] = useState(initial?.edition ?? "");
  const [pageCount, setPageCount] = useState(
    initial?.pageCount?.toString() ?? "",
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title,
      description,
      authorId,
      categoryId,
      publisherId: publisherId || undefined,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      stock: Number(stock),
      lowStockAlert: Number(lowStockAlert),
      condition,
      listingType,
      coverTone: Number(coverTone),
      isbn: isbn || undefined,
      language,
      edition: edition || undefined,
      pageCount: pageCount ? Number(pageCount) : undefined,
    };

    try {
      const url = initial
        ? `/api/seller/books/${initial.id}`
        : "/api/seller/books";
      const method = initial ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message || "Failed to save book.");
        setLoading(false);
        return;
      }

      toast.success(
        initial ? "Book updated successfully." : "Book published successfully.",
      );
      router.push("/seller/books");
      router.refresh();
    } catch {
      toast.error("An error occurred while saving the book.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Core Info */}
        <div className="space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-semibold">Book Details</h2>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="e.g. Sapiens: A Brief History of Humankind"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              Author *
            </label>
            <select
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              required
            >
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              Publisher (optional)
            </label>
            <select
              value={publisherId}
              onChange={(e) => setPublisherId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="">None / Self-published</option>
              {publishers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">
              Description * (min 20 characters)
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              placeholder="Provide an overview of the book's contents, condition, and highlights."
            />
          </div>
        </div>

        {/* Pricing, Condition & Inventory */}
        <div className="space-y-6">
          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold">Pricing & Inventory</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase">
                  Selling Price (BDT) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="350"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase">
                  Original Price (BDT)
                </label>
                <input
                  type="number"
                  min={1}
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="450"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase">
                  Low Stock Alert
                </label>
                <input
                  type="number"
                  min={0}
                  value={lowStockAlert}
                  onChange={(e) => setLowStockAlert(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase">
                  Listing Type
                </label>
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="NEW">New Book</option>
                  <option value="USED">Used Book</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase">
                  Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="NEW">Brand New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="GOOD">Good</option>
                  <option value="ACCEPTABLE">Acceptable</option>
                  <option value="POOR">Poor</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">
                Cover Tone Style (1-6)
              </label>
              <div className="mt-2 flex gap-3">
                {[1, 2, 3, 4, 5, 6].map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setCoverTone(tone)}
                    className={`flex size-8 items-center justify-center rounded-lg border text-xs font-bold transition-all ${
                      coverTone === tone
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Publishing details */}
          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <h2 className="text-base font-semibold">Publishing Metadata</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase">
                  ISBN
                </label>
                <input
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="978-..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase">
                  Language
                </label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase">
                  Edition
                </label>
                <input
                  type="text"
                  value={edition}
                  onChange={(e) => setEdition(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="1st Edition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase">
                  Page Count
                </label>
                <input
                  type="number"
                  min={1}
                  value={pageCount}
                  onChange={(e) => setPageCount(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="320"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow hover:opacity-90 disabled:opacity-60"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          {initial ? "Save Changes" : "Publish Book"}
        </button>
      </div>
    </form>
  );
}
