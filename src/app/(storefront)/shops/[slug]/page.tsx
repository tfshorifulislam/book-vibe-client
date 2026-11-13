import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Star } from "lucide-react";

import { CollectionPage } from "@/components/marketplace/collection-page";
import { getShopBySlug } from "@/lib/data/books";
import { formatNumber } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  return shop ? { title: shop.name } : { title: "Shop not found" };
}

export default async function ShopPage({ params }: Props) {
  const { slug } = await params;
  const shop = await getShopBySlug(slug);
  if (!shop) notFound();
  return (
    <CollectionPage
      eyebrow="Shop"
      title={shop.name}
      description={shop.description ?? undefined}
      count={shop.bookCount}
      books={shop.books}
      breadcrumbs={[{ label: "Shops", href: "/shops" }]}
      action={
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-xs">
          <span className="flex items-center gap-1">
            <Star className="size-3.5 fill-secondary text-secondary" />
            <strong>{shop.rating.toFixed(1)}</strong> ({formatNumber(shop.reviewCount)})
          </span>
          {shop.location ? (
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="size-3.5" /> {shop.location}
            </span>
          ) : null}
        </div>
      }
    />
  );
}
