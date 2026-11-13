import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/forms";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      description="Sign in to track orders, manage your wishlist, and keep reading."
    >
      <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
