import { BookGrid } from "@/components/shared/BookGrid";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import type { Book } from "@/types/book";

interface BestSellingBooksProps {
  books: Book[];
}

export function BestSellingBooks({ books }: BestSellingBooksProps) {
  return (
    <SectionContainer>
      <SectionHeading
        eyebrow="Reader favorites"
        title="Best Selling Books"
        description="The titles readers have been ordering most, ranked by sales on BookHand."
        action={{ label: "View All Best Sellers", href: "/books?sort=popular" }}
      />

      <div className="mt-8">
        <BookGrid
          books={books}
          ranked
          emptyTitle="No sales ranking available yet"
          emptyDescription="Best-selling titles will appear here as orders come in."
          emptyAction={{ label: "Browse Books", href: "/books" }}
        />
      </div>
    </SectionContainer>
  );
}
