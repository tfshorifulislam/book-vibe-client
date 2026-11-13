import type { Metadata } from "next";

import { SellerCard } from "@/components/shared/SellerCard";
import { getShops } from "@/lib/data/books";

export const metadata: Metadata = { title: "Book shops" };

export default async function ShopsPage() {
  const shops = await getShops();
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Trusted book shops</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Every seller on BookHand has a public shop profile, ratings, and a catalogue you can browse.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shops.map((shop) => (
          <SellerCard
            key={shop.id}
            seller={{
              id: shop.ownerId,
              shopSlug: shop.slug,
              shopName: shop.name,
              rating: shop.rating,
              reviewCount: shop.reviewCount,
              totalBooks: shop.bookCount,
              location: shop.location,
              logo: shop.logo ?? undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}
