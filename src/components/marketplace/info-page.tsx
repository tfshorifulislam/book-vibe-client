import type { ReactNode } from "react";

export function InfoPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {eyebrow ? (
        <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">{eyebrow}</p>
      ) : null}
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {description ? <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p> : null}
      <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground">{children}</div>
    </div>
  );
}

export function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  );
}
