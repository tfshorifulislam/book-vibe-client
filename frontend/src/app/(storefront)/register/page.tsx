import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Join BookHand"
      description="Buy books from trusted sellers, or open a shop and sell your own."
    >
      <Suspense
        fallback={<div className="h-96 animate-pulse rounded-lg bg-muted" />}
      >
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
