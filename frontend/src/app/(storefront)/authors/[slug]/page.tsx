import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionPage } from "@/components/marketplace/collection-page";
import { toBookCard, getAuthorBySlug } from "@/lib/data/books";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  return author ? { title: author.name } : { title: "Author not found" };
}

export default async function AuthorPage({ params }: Props) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);
  if (!author) notFound();
  const books = author.books.map(toBookCard);
  return (
    <CollectionPage
      eyebrow="Author"
      title={author.name}
      description={author.bio ?? undefined}
      count={books.length}
      books={books}
      breadcrumbs={[{ label: "Authors", href: "/authors" }]}
    />
  );
}
