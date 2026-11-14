"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Edit, Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

type BookItem = {
  id: string;
  slug: string;
  title: string;
  price: number;
  stock: number;
  lowStockAlert: number;
  condition: string;
  category: { name: string };
};

export function InventoryManager({
  initialBooks,
}: {
  initialBooks: BookItem[];
}) {
  const [books, setBooks] = useState(initialBooks);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newStock, setNewStock] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.category.name.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleSaveStock(id: string) {
    const parsed = parseInt(newStock, 10);
    if (isNaN(parsed) || parsed < 0) {
      toast.error("Enter a valid non-negative number.");
      return;
    }

    setLoading(true);
    try {
      const book = books.find((b) => b.id === id);
      if (!book) return;

      const res = await fetch(`/api/seller/books/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...book,
          stock: parsed,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to update stock.");
        setLoading(false);
        return;
      }

      setBooks(books.map((b) => (b.id === id ? { ...b, stock: parsed } : b)));
      setEditingId(null);
      toast.success("Stock quantity updated.");
    } catch {
      toast.error("Error updating stock.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Filter by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none sm:w-72"
        />
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-destructive" /> Out of stock
            ({books.filter((b) => b.stock === 0).length})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-warning" /> Low stock (
            {
              books.filter((b) => b.stock > 0 && b.stock <= b.lowStockAlert)
                .length
            }
            )
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {filtered.length ? (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Book Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">In Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((b) => {
                const isOutOfStock = b.stock === 0;
                const isLowStock = b.stock > 0 && b.stock <= b.lowStockAlert;
                const isEditing = editingId === b.id;

                return (
                  <tr key={b.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link
                        href={`/books/${b.slug}`}
                        className="line-clamp-1 font-medium hover:text-primary"
                      >
                        {b.title}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {b.condition}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {b.category.name}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatPrice(b.price)}
                    </td>
                    <td className="px-4 py-3">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive">
                          <TriangleAlert className="size-3" /> Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning">
                          <TriangleAlert className="size-3" /> Low Stock
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-success">
                          Healthy
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            value={newStock}
                            onChange={(e) => setNewStock(e.target.value)}
                            className="w-16 rounded border border-primary bg-background px-2 py-1 text-sm font-bold text-foreground focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleSaveStock(b.id)}
                            className="rounded p-1 text-primary hover:bg-primary/10"
                            aria-label="Confirm stock"
                          >
                            {loading ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Check className="size-4" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="font-bold text-foreground">
                          {b.stock} units
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(b.id);
                            setNewStock(b.stock.toString());
                          }}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <Edit className="size-3.5" /> Adjust
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No books matching search.
          </div>
        )}
      </div>
    </div>
  );
}
