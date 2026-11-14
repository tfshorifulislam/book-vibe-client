"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Upload } from "lucide-react";
import { toast } from "sonner";

const input =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary";

export function ProfileForm({
  initial,
}: {
  initial: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
    bio: string;
  };
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function uploadAvatar(file: File) {
    setUploading(true);
    const data = new FormData();
    data.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body: data });
    const payload = (await response.json()) as {
      success: boolean;
      data?: { url: string };
      message?: string;
    };
    setUploading(false);
    if (!response.ok || !payload.success || !payload.data) {
      toast.error(payload.message ?? "Unable to upload the image.");
      return;
    }
    setForm((current) => ({ ...current, avatar: payload.data!.url }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone || undefined,
        avatar: form.avatar || undefined,
        bio: form.bio || undefined,
      }),
    });
    const payload = (await response.json()) as {
      success: boolean;
      message?: string;
    };
    setPending(false);
    if (!response.ok || !payload.success) {
      toast.error(payload.message ?? "Unable to update your profile.");
      return;
    }
    toast.success("Profile updated.");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-2xl space-y-4 rounded-xl border border-border bg-card p-5"
    >
      <div className="flex items-center gap-4">
        <span className="flex size-16 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xl font-bold text-primary">
          {form.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.avatar} alt="" className="size-16 object-cover" />
          ) : (
            form.name.slice(0, 2).toUpperCase()
          )}
        </span>
        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted">
          {uploading ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          Upload photo
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) uploadAvatar(file);
            }}
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Full name</span>
          <input
            required
            className={input}
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Email</span>
          <input disabled className={input} value={form.email} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium">Phone</span>
          <input
            className={input}
            value={form.phone}
            onChange={(event) =>
              setForm({ ...form, phone: event.target.value })
            }
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium">Bio</span>
        <textarea
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          value={form.bio}
          onChange={(event) => setForm({ ...form, bio: event.target.value })}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
      >
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : null} Save
        changes
      </button>
    </form>
  );
}
