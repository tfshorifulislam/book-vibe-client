import { Router } from "express";

import { getBookCards } from "@/lib/data/books";
import { prisma } from "@/lib/db";

const router = Router();

// GET /api/books
router.get("/books", async (req, res, next) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : undefined;
    const category =
      typeof req.query.category === "string" ? req.query.category : undefined;
    const author =
      typeof req.query.author === "string" ? req.query.author : undefined;
    const publisher =
      typeof req.query.publisher === "string" ? req.query.publisher : undefined;
    const condition =
      typeof req.query.condition === "string" ? req.query.condition : undefined;
    const minPrice = req.query.minPrice
      ? Number(req.query.minPrice)
      : undefined;
    const maxPrice = req.query.maxPrice
      ? Number(req.query.maxPrice)
      : undefined;
    const sort =
      typeof req.query.sort === "string" ? req.query.sort : undefined;
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    const result = await getBookCards({
      q,
      category,
      author,
      publisher,
      condition,
      minPrice,
      maxPrice,
      sort,
      page,
      limit,
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

// GET /api/categories
router.get("/categories", async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
        _count: { select: { books: true } },
      },
    });

    return res.json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
});

// GET /api/authors
router.get("/authors", async (req, res, next) => {
  try {
    const authors = await prisma.author.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { books: true } } },
    });
    return res.json({ success: true, data: { authors } });
  } catch (error) {
    next(error);
  }
});

// GET /api/publishers
router.get("/publishers", async (req, res, next) => {
  try {
    const publishers = await prisma.publisher.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { books: true } } },
    });
    return res.json({ success: true, data: { publishers } });
  } catch (error) {
    next(error);
  }
});

// GET /api/shops
router.get("/shops", async (req, res, next) => {
  try {
    const shops = await prisma.shop.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      include: { _count: { select: { books: true } } },
    });
    return res.json({ success: true, data: { shops } });
  } catch (error) {
    next(error);
  }
});

// GET /api/search
router.get("/search", async (req, res, next) => {
  try {
    const q = (typeof req.query.q === "string" ? req.query.q : "").trim();
    if (!q) {
      return res.json({
        success: true,
        data: { books: [], categories: [], authors: [] },
      });
    }

    const [books, categories, authors] = await Promise.all([
      getBookCards({ q, limit: 6, sort: "popular" }),
      prisma.category.findMany({
        where: { isActive: true, name: { contains: q, mode: "insensitive" } },
        select: { id: true, name: true, slug: true },
        take: 4,
      }),
      prisma.author.findMany({
        where: { name: { contains: q, mode: "insensitive" } },
        select: { id: true, name: true, slug: true },
        take: 4,
      }),
    ]);

    return res.json({
      success: true,
      data: { books: books.books, categories, authors },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
