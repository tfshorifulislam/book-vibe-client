import { BookCard } from "@/components/shared/BookCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Book } from "@/types/book";

interface BookGridProps {
  books: Book[];
  ranked?: boolean;
  badge?: "new" | "used";
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: {
    label: string;
    href: string;
  };
}

export function BookGrid({
  books,
  ranked = false,
  badge,
  emptyTitle = "No books available yet",
  emptyDescription = "New titles will appear here as sellers list them.",
  emptyAction,
}: BookGridProps) {
  if (books.length === 0) {
    return (
      <EmptyState
        icon="BookOpen"
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {books.map((book, index) => (
        <BookCard
          key={book.id}
          book={book}
          rank={ranked ? index + 1 : undefined}
          badge={badge}
        />
      ))}
    </div>
  );
}
