import Link from "next/link";
import type { ReactNode } from "react";
import { BookOpen } from "lucide-react";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BookOpen className="size-4" />
            </span>
            BookHand
          </Link>
          <h1 className="mt-5 text-2xl font-bold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
