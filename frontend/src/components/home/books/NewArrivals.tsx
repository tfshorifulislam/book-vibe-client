import { BookGrid } from "@/components/shared/BookGrid";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import type { Book } from "@/types/book";

interface NewArrivalsProps {
  books: Book[];
}

export function NewArrivals({ books }: NewArrivalsProps) {
  return (
    <SectionContainer className="bg-muted/30">
      <SectionHeading
        eyebrow="Fresh on the shelf"
        title="New Arrivals"
        description="Recently listed books from sellers across BookHand, sorted by the newest listing date."
        action={{ label: "View All New Arrivals", href: "/books?sort=newest" }}
      />

      <div className="mt-8">
        <BookGrid
          books={books}
          badge="new"
          emptyTitle="No new arrivals yet"
          emptyDescription="Newly listed books will appear here as soon as they are published."
          emptyAction={{ label: "Browse Books", href: "/books" }}
        />
      </div>
    </SectionContainer>
  );
}
