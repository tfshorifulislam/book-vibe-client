import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CollectionPage } from "@/components/marketplace/collection-page";
import { getPublisherBySlug, toBookCard } from "@/lib/data/books";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const publisher = await getPublisherBySlug(slug);
  return publisher
    ? { title: publisher.name }
    : { title: "Publisher not found" };
}

export default async function PublisherPage({ params }: Props) {
  const { slug } = await params;
  const publisher = await getPublisherBySlug(slug);
  if (!publisher) notFound();
  const books = publisher.books.map(toBookCard);
  return (
    <CollectionPage
      eyebrow="Publisher"
      title={publisher.name}
      description={publisher.description ?? undefined}
      count={books.length}
      books={books}
      breadcrumbs={[{ label: "Publishers", href: "/publishers" }]}
    />
  );
}
