import { BookGrid } from "@/components/shared/BookGrid";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import type { Book } from "@/types/book";

interface UsedBooksProps {
  books: Book[];
}

export function UsedBooks({ books }: UsedBooksProps) {
  return (
    <SectionContainer>
      <SectionHeading
        eyebrow="Pre-loved reads"
        title="Used Books Collection"
        description="Affordable second-hand titles with clear condition details from independent sellers."
        action={{ label: "View All Used Books", href: "/books?condition=USED" }}
      />

      <div className="mt-8">
        <BookGrid
          books={books}
          badge="used"
          emptyTitle="No used books listed yet"
          emptyDescription="Pre-loved titles will appear here once sellers list them."
          emptyAction={{ label: "Browse Books", href: "/books" }}
        />
      </div>
    </SectionContainer>
  );
}
