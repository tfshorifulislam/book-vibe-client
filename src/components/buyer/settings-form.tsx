"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

const input = "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary";

export function SettingsForm() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("The new passwords do not match.");
      return;
    }
    setPending(true);
    const response = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const payload = (await response.json()) as { success: boolean; message?: string };
    setPending(false);
    if (!response.ok || !payload.success) {
      toast.error(payload.message ?? "Unable to change your password.");
      return;
    }
    toast.success("Password updated.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-5">
      <div>
        <h2 className="text-base font-bold">Change password</h2>
        <p className="text-xs text-muted-foreground">Use at least 8 characters with upper and lower case letters and a number.</p>
      </div>
      <label className="block"><span className="mb-1 block text-xs font-medium">Current password</span><input required type="password" autoComplete="current-password" className={input} value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label>
      <label className="block"><span className="mb-1 block text-xs font-medium">New password</span><input required type="password" autoComplete="new-password" minLength={8} className={input} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label>
      <label className="block"><span className="mb-1 block text-xs font-medium">Confirm new password</span><input required type="password" autoComplete="new-password" minLength={8} className={input} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
      <button type="submit" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
        {pending ? <LoaderCircle className="size-4 animate-spin" /> : null} Update password
      </button>
    </form>
  );
}
