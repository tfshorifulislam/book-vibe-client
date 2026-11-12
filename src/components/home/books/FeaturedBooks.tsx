import { BookGrid } from "@/components/shared/BookGrid";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import type { Book } from "@/types/book";

interface FeaturedBooksProps {
  books: Book[];
}

export function FeaturedBooks({ books }: FeaturedBooksProps) {
  return (
    <SectionContainer className="bg-muted/30">
      <SectionHeading
        eyebrow="Hand-picked for readers"
        title="Featured Books"
        description="A selection of titles worth opening next, chosen from across the BookHand catalogue."
        action={{ label: "View All Books", href: "/books?sort=featured" }}
      />

      <div className="mt-8">
        <BookGrid
          books={books}
          emptyTitle="No featured books yet"
          emptyDescription="Featured titles will appear here once sellers publish their listings."
          emptyAction={{ label: "Browse Books", href: "/books" }}
        />
      </div>
    </SectionContainer>
  );
}
