import "server-only";

import { prisma } from "@/lib/db";
import type { Book } from "@/types/book";
import type { Category } from "@/types/category";
import type { TopSeller } from "@/types/seller";

export const bookCardSelect = {
  id: true,
  slug: true,
  title: true,
  price: true,
  originalPrice: true,
  coverImage: true,
  coverTone: true,
  condition: true,
  listingType: true,
  stock: true,
  ratingSum: true,
  ratingCount: true,
  salesCount: true,
  isFeatured: true,
  isNewArrival: true,
  isBestSeller: true,
  listedAt: true,
  author: { select: { name: true, slug: true } },
  publisher: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
  shop: {
    select: {
      name: true,
      slug: true,
      owner: { select: { id: true, name: true } },
    },
  },
};

export type BookCardRow = {
  id: string;
  slug: string;
  title: string;
  price: number;
  originalPrice: number | null;
  coverImage: string | null;
  coverTone: string | null;
  condition: string;
  listingType: string;
  stock: number;
  ratingSum: number;
  ratingCount: number;
  salesCount: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  listedAt: Date | string;
  author: { name: string; slug: string };
  publisher: { name: string; slug: string };
  category: { name: string; slug: string };
  shop: {
    name: string;
    slug: string;
    owner: { id: string; name: string };
  };
};

export function toBookCard(book: BookCardRow): Book {
  const rating =
    book.ratingCount > 0
      ? Math.round((book.ratingSum / book.ratingCount) * 10) / 10
      : undefined;
  return {
    id: book.id,
    slug: book.slug,
    title: book.title,
    author: book.author.name,
    categorySlug: book.category.slug,
    publisher: book.publisher?.name,
    coverImage: book.coverImage ?? undefined,
    coverTone: typeof book.coverTone === "number" ? book.coverTone : undefined,
    price: book.price,
    originalPrice: book.originalPrice ?? undefined,
    discount:
      book.originalPrice && book.originalPrice > book.price
        ? Math.round(
            ((book.originalPrice - book.price) / book.originalPrice) * 100,
          )
        : undefined,
    rating,
    reviewCount: book.ratingCount,
    condition: book.condition as Book["condition"],
    listingType: book.listingType as Book["listingType"],
    stock: book.stock,
    sellerName: book.shop.name,
    sellerId: book.shop.owner.id,
    sellerShopSlug: book.shop.slug,
    isFeatured: book.isFeatured,
    isNewArrival: book.isNewArrival,
    isBestSeller: book.isBestSeller,
    salesCount: book.salesCount,
    listedAt:
      typeof book.listedAt === "string"
        ? book.listedAt.slice(0, 10)
        : new Date(book.listedAt).toISOString().slice(0, 10),
  };
}

export type BookFilters = {
  q?: string;
  category?: string;
  author?: string;
  publisher?: string;
  shop?: string;
  condition?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  includeInactive?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildBookWhere(filters: BookFilters): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (!filters.includeInactive) where.isActive = true;
  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q } },
      { description: { contains: filters.q } },
      { isbn: { contains: filters.q } },
      { author: { is: { name: { contains: filters.q } } } },
      { publisher: { is: { name: { contains: filters.q } } } },
      { shop: { is: { name: { contains: filters.q } } } },
    ];
  }
  if (filters.category) {
    where.category = {
      is: {
        OR: [
          { slug: filters.category },
          { parent: { is: { slug: filters.category } } },
        ],
      },
    };
  }
  if (filters.author) where.author = { is: { slug: filters.author } };
  if (filters.publisher) where.publisher = { is: { slug: filters.publisher } };
  if (filters.shop) where.shop = { is: { slug: filters.shop } };
  if (filters.condition) {
    const conditions = filters.condition.split(",").filter(Boolean);
    if (conditions.length) where.condition = { in: conditions };
  }
  if (filters.listingType) where.listingType = filters.listingType;
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {};
    if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
    if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
  }
  if (filters.onSale) where.originalPrice = { not: null };
  if (filters.featured) where.isFeatured = true;
  if (filters.newArrival) where.isNewArrival = true;
  if (filters.bestSeller) where.isBestSeller = true;
  return where;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildOrderBy(sort?: string): any {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "rating":
      return { ratingSum: "desc" };
    case "popular":
      return { salesCount: "desc" };
    case "title":
      return { title: "asc" };
    case "oldest":
      return { listedAt: "asc" };
    default:
      return { listedAt: "desc" };
  }
}

export async function getBookCards(filters: BookFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const where = buildBookWhere(filters);

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      select: bookCardSelect,
      orderBy: buildOrderBy(filters.sort),
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.book.count({ where }),
  ]);

  return {
    books: books.map(toBookCard),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getAllBooks() {
  const books = await prisma.book.findMany({
    where: { isActive: true },
    select: bookCardSelect,
    orderBy: { listedAt: "desc" },
  });
  return books.map(toBookCard);
}

export async function getBookBySlug(slug: string) {
  return prisma.book.findFirst({
    where: { slug, isActive: true },
    include: {
      author: true,
      category: { include: { parent: true } },
      publisher: true,
      shop: {
        include: {
          owner: { select: { id: true, name: true, email: true } },
        },
      },
      images: { orderBy: { order: "asc" } },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      questions: {
        where: { isApproved: true },
        include: {
          user: { select: { name: true } },
          answers: {
            include: { user: { select: { name: true, role: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function getRelatedBooks(book: {
  id: string;
  categoryId: string;
  shopId: string;
}) {
  const books = await prisma.book.findMany({
    where: {
      isActive: true,
      id: { not: book.id },
      OR: [{ categoryId: book.categoryId }, { shopId: book.shopId }],
    },
    select: bookCardSelect,
    orderBy: { salesCount: "desc" },
    take: 4,
  });
  return books.map(toBookCard);
}

export async function getCategories(
  includeInactive = false,
): Promise<Category[]> {
  const categories = await prisma.category.findMany({
    where: includeInactive ? {} : { isActive: true },
    include: {
      children: {
        where: includeInactive ? {} : { isActive: true },
        include: {
          _count: {
            select: { books: { where: { isActive: true } } },
          },
        },
        orderBy: { order: "asc" },
      },
      _count: {
        select: { books: { where: { isActive: true } } },
      },
    },
    orderBy: { order: "asc" },
  });

  const roots = categories.filter((category) => !category.parentId);
  return roots.map((category) => {
    const children = category.children.map((child) => ({
      id: child.id,
      slug: child.slug,
      name: child.name,
      description: child.description ?? undefined,
      icon: child.icon ?? undefined,
      image: child.image ?? undefined,
      bookCount: child._count.books,
      isActive: child.isActive,
      order: child.order,
    }));
    return {
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description ?? undefined,
      icon: category.icon ?? undefined,
      image: category.image ?? undefined,
      bookCount:
        category._count.books +
        children.reduce((sum, child) => sum + child.bookCount, 0),
      isActive: category.isActive,
      order: category.order,
      children,
    };
  });
}

export async function getAuthors() {
  const authors = await prisma.author.findMany({
    include: { _count: { select: { books: { where: { isActive: true } } } } },
    orderBy: { name: "asc" },
  });
  return authors.map((author) => ({
    id: author.id,
    name: author.name,
    slug: author.slug,
    bio: author.bio,
    image: author.image,
    bookCount: author._count.books,
  }));
}

export async function getAuthorBySlug(slug: string) {
  return prisma.author.findUnique({
    where: { slug },
    include: {
      books: {
        where: { isActive: true },
        select: bookCardSelect,
        orderBy: { salesCount: "desc" },
      },
    },
  });
}

export async function getPublishers() {
  const publishers = await prisma.publisher.findMany({
    include: { _count: { select: { books: { where: { isActive: true } } } } },
    orderBy: { name: "asc" },
  });
  return publishers.map((publisher) => ({
    id: publisher.id,
    name: publisher.name,
    slug: publisher.slug,
    description: publisher.description,
    logo: publisher.logo,
    bookCount: publisher._count.books,
  }));
}

export async function getPublisherBySlug(slug: string) {
  return prisma.publisher.findUnique({
    where: { slug },
    include: {
      books: {
        where: { isActive: true },
        select: bookCardSelect,
        orderBy: { salesCount: "desc" },
      },
    },
  });
}

export async function getShops() {
  const shops = await prisma.shop.findMany({
    where: { status: "ACTIVE" },
    include: {
      owner: { select: { id: true, name: true } },
      books: {
        where: { isActive: true },
        select: { ratingSum: true, ratingCount: true },
      },
      _count: { select: { books: { where: { isActive: true } } } },
    },
    orderBy: { createdAt: "asc" },
  });

  return shops.map((shop) => {
    const ratingCount = shop.books.reduce(
      (sum, book) => sum + book.ratingCount,
      0,
    );
    const ratingSum = shop.books.reduce((sum, book) => sum + book.ratingSum, 0);
    return {
      id: shop.id,
      ownerId: shop.owner.id,
      ownerName: shop.owner.name,
      name: shop.name,
      slug: shop.slug,
      logo: shop.logo,
      banner: shop.banner,
      description: shop.description,
      city: shop.city,
      district: shop.district,
      status: shop.status,
      bookCount: shop._count.books,
      rating:
        ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0,
      reviewCount: ratingCount,
      location: [shop.city, shop.district].filter(Boolean).join(", "),
    };
  });
}

export async function getShopBySlug(slug: string) {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, name: true, email: true, phone: true } },
      books: {
        where: { isActive: true },
        select: bookCardSelect,
        orderBy: { listedAt: "desc" },
      },
      _count: { select: { books: { where: { isActive: true } } } },
    },
  });
  if (!shop) return null;

  const ratingCount = shop.books.reduce(
    (sum, book) => sum + book.ratingCount,
    0,
  );
  const ratingSum = shop.books.reduce((sum, book) => sum + book.ratingSum, 0);

  return {
    ...shop,
    books: shop.books.map(toBookCard),
    bookCount: shop._count.books,
    rating:
      ratingCount > 0 ? Math.round((ratingSum / ratingCount) * 10) / 10 : 0,
    reviewCount: ratingCount,
    location: [shop.city, shop.district].filter(Boolean).join(", "),
  };
}

export async function getTopSellers(limit = 6): Promise<TopSeller[]> {
  const shops = await getShops();
  return shops
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    .slice(0, limit)
    .map((shop) => ({
      id: shop.ownerId,
      shopSlug: shop.slug,
      shopName: shop.name,
      logo: shop.logo ?? undefined,
      rating: shop.rating,
      reviewCount: shop.reviewCount,
      totalBooks: shop.bookCount,
      location: shop.location,
    }));
}

export async function getPopularSearches(): Promise<string[]> {
  const [categories, authors] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null, isActive: true },
      select: { name: true },
      orderBy: { order: "asc" },
      take: 3,
    }),
    prisma.author.findMany({
      select: { name: true },
      orderBy: { books: { _count: "desc" } },
      take: 3,
    }),
  ]);
  return Array.from(
    new Set([
      ...categories.map((category) => category.name),
      ...authors.map((author) => author.name),
    ]),
  );
}

export async function getFeaturedBooks(limit = 8) {
  return (await getBookCards({ featured: true, limit, sort: "popular" })).books;
}

export async function getBestSellingBooks(limit = 4) {
  return (await getBookCards({ bestSeller: true, limit, sort: "popular" }))
    .books;
}

export async function getNewArrivals(limit = 4) {
  return (await getBookCards({ newArrival: true, limit, sort: "newest" }))
    .books;
}

export async function getUsedBooks(limit = 4) {
  return (await getBookCards({ listingType: "USED", limit, sort: "popular" }))
    .books;
}

export async function getPriceRange() {
  const result = await prisma.book.aggregate({
    where: { isActive: true },
    _min: { price: true },
    _max: { price: true },
  });
  return {
    min: result._min.price ?? 0,
    max: result._max.price ?? 10000,
  };
}
