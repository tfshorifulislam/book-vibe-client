import { cacheLife } from "next/cache";

import { prisma } from "@/lib/db";
import {
  getAllBooks as getAllBookCards,
  getBestSellingBooks as getBestSelling,
  getBookCards,
  getCategories as getCategoryRows,
  getFeaturedBooks as getFeatured,
  getNewArrivals as getNew,
  getPopularSearches as getSearches,
  getTopSellers as getSellers,
  getUsedBooks as getUsed,
} from "@/lib/data/books";
import type { Book } from "@/types/book";
import type { Category } from "@/types/category";
import type { Offer } from "@/types/offer";
import type { TopSeller } from "@/types/seller";
import type { Testimonial } from "@/types/testimonial";

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  return getCategoryRows();
}

export async function getAllBooks(): Promise<Book[]> {
  "use cache";
  cacheLife("hours");
  return getAllBookCards();
}

export async function getFeaturedBooks(limit = 8): Promise<Book[]> {
  "use cache";
  cacheLife("hours");
  return getFeatured(limit);
}

export async function getBestSellingBooks(limit = 4): Promise<Book[]> {
  "use cache";
  cacheLife("hours");
  return getBestSelling(limit);
}

export async function getNewArrivals(limit = 4): Promise<Book[]> {
  "use cache";
  cacheLife("hours");
  return getNew(limit);
}

export async function getUsedBooks(limit = 4): Promise<Book[]> {
  "use cache";
  cacheLife("hours");
  return getUsed(limit);
}

export async function getTopSellers(limit = 6): Promise<TopSeller[]> {
  "use cache";
  cacheLife("hours");
  return getSellers(limit);
}

export async function getActiveOffers(): Promise<Offer[]> {
  "use cache";
  cacheLife("hours");
  const { books } = await getBookCards({ onSale: true, limit: 4, sort: "popular" });
  if (!books.length) return [];

  const maxDiscount = Math.max(
    ...books.map((book) => book.discount ?? 0),
    0,
  );

  return [
    {
      id: "offer-sale",
      title: "Books on Sale",
      description:
        "Limited-time savings on new and used books from trusted BookHand sellers.",
      discountPercent: maxDiscount || undefined,
      startDate: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      isActive: true,
      books,
    },
  ];
}

export async function getTestimonials(): Promise<Testimonial[]> {
  "use cache";
  cacheLife("hours");
  const reviews = await prisma.review.findMany({
    where: { isApproved: true, rating: { gte: 4 } },
    include: {
      user: { select: { name: true, avatar: true } },
      book: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return reviews.map((review, index) => ({
    id: review.id,
    name: review.user.name,
    avatar: review.user.avatar ?? undefined,
    rating: review.rating,
    review: review.body,
    bookTitle: review.book.title,
    isApproved: review.isApproved,
    order: index,
  }));
}

export async function getPopularSearches(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  return getSearches();
}
