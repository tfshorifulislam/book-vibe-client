import { EmptyState } from "@/components/shared/EmptyState";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { SellerCard } from "@/components/shared/SellerCard";
import type { TopSeller } from "@/types/seller";

interface TopSellersProps {
  sellers: TopSeller[];
}

export function TopSellers({ sellers }: TopSellersProps) {
  return (
    <SectionContainer className="bg-muted/30">
      <SectionHeading
        eyebrow="Independent bookshops"
        title="Top Sellers"
        description="Meet the bookshops and individual sellers readers return to."
        action={{ label: "View All Sellers", href: "/sellers" }}
      />

      <div className="mt-8">
        {sellers.length === 0 ? (
          <EmptyState
            icon="Store"
            title="Seller profiles are on the way"
            description="Top seller profiles will appear here once shops are available."
            action={{ label: "Become a Seller", href: "/register?role=seller" }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sellers.map((seller, index) => (
              <SellerCard key={seller.id} seller={seller} rank={index + 1} />
            ))}
          </div>
        )}
      </div>
    </SectionContainer>
  );
}
