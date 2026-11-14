import Link from "next/link";
import type { ReactNode } from "react";

export function EmptyPanel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? (
        <Link
          href={action.href}
          className="mt-4 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {action.label}
        </Link>
      ) : null}
      {children}
    </div>
  );
}
