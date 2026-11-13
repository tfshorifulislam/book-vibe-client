import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Authentication Callback | BookHand",
};

type Props = {
  searchParams: Promise<{ code?: string; error?: string }>;
};

export default async function AuthCallbackPage({ searchParams }: Props) {
  const { code, error } = await searchParams;

  const hasOAuthConfig =
    Boolean(process.env.GOOGLE_CLIENT_ID) &&
    Boolean(process.env.GOOGLE_CLIENT_SECRET);

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="space-y-4 rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-warning/15 text-warning">
          <ShieldAlert className="size-6" />
        </div>

        <h1 className="text-xl font-bold text-foreground">
          OAuth Authentication
        </h1>

        {!hasOAuthConfig ? (
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Google OAuth integration is structured and awaiting client
              credentials.
            </p>
            <div className="rounded-lg bg-muted p-3 text-left font-mono text-xs">
              GOOGLE_CLIENT_ID=&quot;your-id&quot;
              <br />
              GOOGLE_CLIENT_SECRET=&quot;your-secret&quot;
            </div>
            <p className="text-xs">
              Configure these environment variables in{" "}
              <code className="font-mono">.env</code> to activate one-click
              Google Sign-In.
            </p>
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">
            Authentication failed: {error}
          </p>
        ) : code ? (
          <p className="text-sm text-muted-foreground">
            Processing authorization code and establishing session...
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No authorization response was received.
          </p>
        )}

        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <ArrowLeft className="size-4" /> Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
