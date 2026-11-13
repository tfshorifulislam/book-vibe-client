import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Choose a new password" description="Use at least 8 characters.">
      <Suspense fallback={<div className="h-48 animate-pulse rounded-lg bg-muted" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
