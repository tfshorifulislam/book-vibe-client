import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, User } from "lucide-react";

import { getAuthors } from "@/lib/data/books";

export const metadata: Metadata = { title: "Authors" };

export default async function AuthorsPage() {
  const authors = await getAuthors();
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Authors</h1>
      <p className="mt-2 text-sm text-muted-foreground">Discover books by the authors readers love.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {authors.map((author) => (
          <Link
            key={author.id}
            href={`/authors/${author.slug}`}
            className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="size-5" />
            </span>
            <h2 className="mt-3 font-semibold">{author.name}</h2>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {author.bio ?? "Books available on BookHand."}
            </p>
            <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <BookOpen className="size-3.5" /> {author.bookCount} books
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
