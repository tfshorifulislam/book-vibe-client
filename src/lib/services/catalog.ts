import { cacheLife } from "next/cache";
import {
  MOCK_BEST_SELLING,
  MOCK_CATEGORIES,
  MOCK_FEATURED_BOOKS,
  MOCK_NEW_ARRIVALS,
  MOCK_OFFERS,
  MOCK_TESTIMONIALS,
  MOCK_TOP_SELLERS,
  MOCK_USED_BOOKS,
} from "@/lib/mock-data";
import type { Book } from "@/types/book";
import type { Category } from "@/types/category";
import type { Offer } from "@/types/offer";
import type { TopSeller } from "@/types/seller";
import type { Testimonial } from "@/types/testimonial";

/**
 * API-ready data service for the homepage.
 *
 * The functions below currently read from development fixtures. When the
 * backend is available, replace the fixture reads with fetch calls to the
 * routes documented on each function. The `use cache` directive keeps the
 * homepage in the static shell while the data source is swapped.
 */

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");

  // API: GET /api/categories
  return MOCK_CATEGORIES.filter((category) => category.isActive).sort(
    (a, b) => a.order - b.order,
  );
}

export async function getAllBooks(): Promise<Book[]> {
  "use cache";
  cacheLife("hours");

  // API: GET /api/books
  // Pagination is handled client-side until the backend exposes page/limit.
  const allBooks = [
    ...MOCK_FEATURED_BOOKS,
    ...MOCK_BEST_SELLING,
    ...MOCK_NEW_ARRIVALS,
    ...MOCK_USED_BOOKS,
  ];

  return Array.from(new Map(allBooks.map((book) => [book.id, book])).values());
}

export async function getFeaturedBooks(limit = 8): Promise<Book[]> {
  "use cache";
  cacheLife("hours");

  // API: GET /api/books/featured
  return MOCK_FEATURED_BOOKS.filter((book) => book.isFeatured).slice(0, limit);
}

export async function getBestSellingBooks(limit = 4): Promise<Book[]> {
  "use cache";
  cacheLife("hours");

  // API: GET /api/books/best-selling
  return [...MOCK_BEST_SELLING]
    .sort((a, b) => (b.salesCount ?? 0) - (a.salesCount ?? 0))
    .slice(0, limit);
}

export async function getNewArrivals(limit = 4): Promise<Book[]> {
  "use cache";
  cacheLife("hours");

  // API: GET /api/books/new-arrivals
  return [...MOCK_NEW_ARRIVALS]
    .sort((a, b) => (b.listedAt ?? "").localeCompare(a.listedAt ?? ""))
    .slice(0, limit);
}

export async function getUsedBooks(limit = 4): Promise<Book[]> {
  "use cache";
  cacheLife("hours");

  // API: GET /api/books?condition=USED
  return MOCK_USED_BOOKS.filter(
    (book) => book.listingType === "USED",
  ).slice(0, limit);
}

export async function getTopSellers(limit = 6): Promise<TopSeller[]> {
  "use cache";
  cacheLife("hours");

  // API: GET /api/sellers/top
  return [...MOCK_TOP_SELLERS]
    .sort(
      (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
    )
    .slice(0, limit);
}

export async function getActiveOffers(): Promise<Offer[]> {
  "use cache";
  cacheLife("hours");

  // API: GET /api/offers/active
  const today = new Date().toISOString().slice(0, 10);

  return MOCK_OFFERS.filter((offer) => {
    if (!offer.isActive) return false;
    if (offer.startDate && offer.startDate > today) return false;
    if (offer.expiryDate && offer.expiryDate < today) return false;
    return true;
  });
}

export async function getTestimonials(): Promise<Testimonial[]> {
  "use cache";
  cacheLife("hours");

  // API: GET /api/testimonials
  return MOCK_TESTIMONIALS.filter(
    (testimonial) => testimonial.isApproved,
  ).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function getPopularSearches(): Promise<string[]> {
  "use cache";
  cacheLife("hours");

  const categoryNames = MOCK_CATEGORIES.slice(0, 3).map(
    (category) => category.name,
  );
  const authors = MOCK_FEATURED_BOOKS.slice(0, 3).map((book) => book.author);

  return Array.from(new Set([...categoryNames, ...authors]));
}
