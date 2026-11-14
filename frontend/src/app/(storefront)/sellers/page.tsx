import type { Metadata } from "next";

import { SellerCard } from "@/components/shared/SellerCard";
import { getTopSellers } from "@/lib/data/books";

export const metadata: Metadata = { title: "Top sellers" };

export default async function SellersPage() {
  const sellers = await getTopSellers(50);
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Top sellers
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Highly rated shops with the best catalogues on BookHand.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sellers.map((seller, index) => (
          <SellerCard key={seller.id} seller={seller} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}
