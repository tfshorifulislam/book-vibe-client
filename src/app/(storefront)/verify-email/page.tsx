import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Verify email" };

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Verify your email" description="Confirm your email to secure your account.">
      <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-muted" />}>
        <VerifyEmailForm />
      </Suspense>
    </AuthShell>
  );
}
