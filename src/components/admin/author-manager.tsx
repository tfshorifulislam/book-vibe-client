"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Author = {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  _count: { books: number };
};

export function AuthorManager({ initialAuthors }: { initialAuthors: Author[] }) {
  const router = useRouter();
  const [authors, setAuthors] = useState(initialAuthors);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [bio, setBio] = useState("");

  function handleNameChange(val: string) {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    );
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          bio: bio || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message || "Failed to create author.");
        setLoading(false);
        return;
      }

      toast.success("Author created successfully.");
      setAuthors([...authors, { ...data.author, _count: { books: 0 } }]);
      setOpen(false);
      setName("");
      setSlug("");
      setBio("");
      router.refresh();
    } catch {
      toast.error("An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this author?")) return;

    try {
      const res = await fetch(`/api/admin/authors/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.message || "Cannot delete author with associated books.");
        return;
      }
      toast.success("Author deleted.");
      setAuthors(authors.filter((a) => a.id !== id));
      router.refresh();
    } catch {
      toast.error("Failed to delete author.");
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
          <Plus className="size-4" /> Add Author
        </button>
      </div>

      {open ? (
        <form onSubmit={handleCreate} className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-base font-semibold">New Author Profile</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">Author Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Humayun Ahmed"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase">Slug *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="humayun-ahmed"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase">Biography / Overview</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Renowned Bangladeshi novelist, dramatist, and filmmaker..."
            />
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
              {loading ? <Loader2 className="size-4 animate-spin" /> : null} Save Author
            </button>
          </div>
        </form>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">Author Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Catalog Books</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {authors.map((a) => (
              <tr key={a.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-semibold text-foreground">{a.name}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{a.slug}</td>
                <td className="px-4 py-3 text-xs font-medium">{a._count.books} books</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="text-muted-foreground hover:text-destructive"
                    title="Delete author"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
