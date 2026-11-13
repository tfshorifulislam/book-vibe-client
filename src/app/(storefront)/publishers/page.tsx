import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Building2 } from "lucide-react";

import { getPublishers } from "@/lib/data/books";

export const metadata: Metadata = { title: "Publishers" };

export default async function PublishersPage() {
  const publishers = await getPublishers();
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Publishers</h1>
      <p className="mt-2 text-sm text-muted-foreground">Browse books from publishers around the world.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {publishers.map((publisher) => (
          <Link
            key={publisher.id}
            href={`/publishers/${publisher.slug}`}
            className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </span>
            <h2 className="mt-3 font-semibold">{publisher.name}</h2>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{publisher.description}</p>
            <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <BookOpen className="size-3.5" /> {publisher.bookCount} books
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
