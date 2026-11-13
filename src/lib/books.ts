import type { Book } from "@/types/book";
import type { Category } from "@/types/category";

export const BOOKS_PAGE_SIZE = 12;

export const BOOK_SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "title-asc", label: "Title: A–Z" },
] as const;

export type BookSort = (typeof BOOK_SORT_OPTIONS)[number]["value"];

export const BOOK_AVAILABILITY_OPTIONS = [
  { value: "all", label: "All availability" },
  { value: "in-stock", label: "In stock" },
  { value: "out-of-stock", label: "Out of stock" },
] as const;

export type BookAvailability =
  (typeof BOOK_AVAILABILITY_OPTIONS)[number]["value"];

export interface BookFilters {
  query: string;
  category: string;
  author: string;
  minPrice: string;
  maxPrice: string;
  availability: BookAvailability;
  sort: BookSort;
}

export function parseBookSort(value?: string | null): BookSort {
  if (value === "popular") return "featured";

  const match = BOOK_SORT_OPTIONS.find((option) => option.value === value);
  return match?.value ?? "featured";
}

export function flattenCategories(categories: Category[]): Category[] {
  return categories.flatMap((category) => [
    category,
    ...(category.children ? flattenCategories(category.children) : []),
  ]);
}

export function buildCategoryMap(
  categories: Category[],
): Map<string, Category> {
  return new Map(
    flattenCategories(categories).map((category) => [category.slug, category]),
  );
}

export function getCategoryName(
  categoryMap: Map<string, Category>,
  slug?: string,
): string | undefined {
  if (!slug) return undefined;
  return categoryMap.get(slug)?.name;
}

export function matchesCategory(book: Book, categorySlug: string): boolean {
  if (!categorySlug) return true;
  if (!book.categorySlug) return false;

  return (
    book.categorySlug === categorySlug ||
    book.categorySlug.startsWith(`${categorySlug}/`)
  );
}

export function countBooksInCategory(
  books: Book[],
  categorySlug: string,
): number {
  return books.filter((book) => matchesCategory(book, categorySlug)).length;
}

function parsePriceInput(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function sortBooks(books: Book[], sort: BookSort): Book[] {
  const sorted = [...books];

  switch (sort) {
    case "newest":
      return sorted.sort((a, b) =>
        (b.listedAt ?? "").localeCompare(a.listedAt ?? ""),
      );
    case "price-asc":
      return sorted.sort(
        (a, b) => a.price - b.price || a.title.localeCompare(b.title),
      );
    case "price-desc":
      return sorted.sort(
        (a, b) => b.price - a.price || a.title.localeCompare(b.title),
      );
    case "title-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "featured":
    default:
      return sorted.sort(
        (a, b) =>
          Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)) ||
          (b.salesCount ?? 0) - (a.salesCount ?? 0) ||
          a.title.localeCompare(b.title),
      );
  }
}

export function filterAndSortBooks(
  books: Book[],
  filters: BookFilters,
): Book[] {
  const query = filters.query.trim().toLowerCase();
  const minPrice = parsePriceInput(filters.minPrice);
  const maxPrice = parsePriceInput(filters.maxPrice);

  const filtered = books.filter((book) => {
    if (
      query &&
      !`${book.title} ${book.author}`.toLowerCase().includes(query)
    ) {
      return false;
    }

    if (filters.category && !matchesCategory(book, filters.category)) {
      return false;
    }

    if (filters.author && book.author !== filters.author) {
      return false;
    }

    if (minPrice !== null && book.price < minPrice) return false;
    if (maxPrice !== null && book.price > maxPrice) return false;

    if (filters.availability === "in-stock" && book.stock <= 0) return false;
    if (filters.availability === "out-of-stock" && book.stock > 0) return false;

    return true;
  });

  return sortBooks(filtered, filters.sort);
}

export function getPriceBounds(books: Book[]): { min: number; max: number } {
  if (books.length === 0) return { min: 0, max: 0 };

  const prices = books.map((book) => book.price);
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  };
}

export function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);
  const sorted = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];

  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous && page - previous > 1) result.push("ellipsis");
    result.push(page);
  });

  return result;
}
