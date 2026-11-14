import { Router } from "express";

import { bookCardSelect, toBookCard } from "@/lib/data/books";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/middleware/auth";
import { ApiError } from "@/middleware/error";
import {
  contactSchema,
  newsletterSchema,
  questionAnswerSchema,
  questionSchema,
  reviewSchema,
} from "@/lib/validators";

const router = Router();

// ================= WISHLIST =================

router.get("/wishlist", requireAuth, async (req, res, next) => {
  try {
    const wishlist = await prisma.wishlist.upsert({
      where: { userId: req.user!.userId },
      update: {},
      create: { userId: req.user!.userId },
      include: {
        items: {
          include: { book: { select: bookCardSelect } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return res.json({
      success: true,
      data: {
        id: wishlist.id,
        items: wishlist.items.map((item) => ({
          itemId: item.id,
          book: toBookCard(item.book),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/wishlist", requireAuth, async (req, res, next) => {
  try {
    const bookId = req.body.bookId;
    if (!bookId || typeof bookId !== "string") {
      throw new ApiError("Book ID is required.", 400);
    }

    const book = await prisma.book.findFirst({
      where: { id: bookId, isActive: true },
      select: { id: true },
    });
    if (!book) throw new ApiError("Book not found.", 404);

    const wishlist = await prisma.wishlist.upsert({
      where: { userId: req.user!.userId },
      update: {},
      create: { userId: req.user!.userId },
    });

    await prisma.wishlistItem.upsert({
      where: {
        wishlistId_bookId: { wishlistId: wishlist.id, bookId: book.id },
      },
      update: {},
      create: { wishlistId: wishlist.id, bookId: book.id },
    });

    return res.json({ success: true, message: "Added to wishlist." });
  } catch (error) {
    next(error);
  }
});

router.delete(["/wishlist", "/wishlist/:id"], requireAuth, async (req, res, next) => {
  try {
    const bookOrItemId = (req.params.id ||
      req.query.bookId ||
      req.body?.bookId) as string;

    if (!bookOrItemId) {
      throw new ApiError("Book ID or Wishlist Item ID is required.", 400);
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user!.userId },
    });

    if (wishlist) {
      await prisma.wishlistItem.deleteMany({
        where: {
          wishlistId: wishlist.id,
          OR: [{ id: bookOrItemId }, { bookId: bookOrItemId }],
        },
      });
    }

    return res.json({ success: true, message: "Removed from wishlist." });
  } catch (error) {
    next(error);
  }
});

// ================= REVIEWS =================

router.get("/reviews", async (req, res, next) => {
  try {
    const bookId = req.query.bookId as string | undefined;
    const userId = req.query.userId as string | undefined;

    const where: Record<string, unknown> = { isApproved: true };
    if (bookId) where.bookId = bookId;
    if (userId) where.userId = userId;

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        book: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return res.json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
});

router.post("/reviews", requireAuth, async (req, res, next) => {
  try {
    const input = reviewSchema.parse(req.body);
    const userId = req.user!.userId;

    const existing = await prisma.review.findUnique({
      where: { bookId_userId: { bookId: input.bookId, userId } },
    });
    if (existing) {
      throw new ApiError("You have already reviewed this book.", 409);
    }

    const review = await prisma.review.create({
      data: {
        bookId: input.bookId,
        userId,
        rating: input.rating,
        title: input.title,
        body: input.body,
      },
    });

    // Update book rating stats
    const stats = await prisma.review.aggregate({
      where: { bookId: input.bookId },
      _sum: { rating: true },
      _count: { rating: true },
    });

    await prisma.book.update({
      where: { id: input.bookId },
      data: {
        ratingSum: stats._sum.rating || 0,
        ratingCount: stats._count.rating || 0,
      },
    });

    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/reviews or /api/reviews/:id
router.delete(
  ["/reviews", "/reviews/:id"],
  requireAuth,
  async (req, res, next) => {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const reviewId = req.params.id as string | undefined;
      const bookId = (req.query.bookId || req.body?.bookId) as
        | string
        | undefined;

      if (!reviewId && !bookId) {
        throw new ApiError(
          "Review ID or bookId is required to delete a review.",
          400,
        );
      }

      const review = await prisma.review.findFirst({
        where: reviewId
          ? { id: reviewId }
          : {
              bookId,
              userId: userRole === "admin" ? undefined : userId,
            },
      });

      if (!review) {
        throw new ApiError("Review not found.", 404);
      }

      if (review.userId !== userId && userRole !== "admin") {
        throw new ApiError(
          "You do not have permission to delete this review.",
          403,
        );
      }

      await prisma.review.delete({ where: { id: review.id } });

      // Recalculate book rating statistics
      const stats = await prisma.review.aggregate({
        where: { bookId: review.bookId, isApproved: true },
        _sum: { rating: true },
        _count: { rating: true },
      });

      await prisma.book.update({
        where: { id: review.bookId },
        data: {
          ratingSum: stats._sum.rating || 0,
          ratingCount: stats._count.rating || 0,
        },
      });

      return res.json({
        success: true,
        message: "Review deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
);

// ================= QUESTIONS & ANSWERS =================

router.get("/questions", async (req, res, next) => {
  try {
    const bookId = req.query.bookId as string | undefined;
    const questions = await prisma.question.findMany({
      where: bookId ? { bookId, isApproved: true } : { isApproved: true },
      include: {
        user: { select: { id: true, name: true } },
        answers: {
          include: { user: { select: { id: true, name: true, role: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, data: questions });
  } catch (error) {
    next(error);
  }
});

router.post("/questions", requireAuth, async (req, res, next) => {
  try {
    const input = questionSchema.parse(req.body);
    const question = await prisma.question.create({
      data: {
        bookId: input.bookId,
        userId: req.user!.userId,
        body: input.body,
      },
    });
    return res.status(201).json({ success: true, data: question });
  } catch (error) {
    next(error);
  }
});

router.post("/answers", requireAuth, async (req, res, next) => {
  try {
    const input = questionAnswerSchema.parse(req.body);
    const answer = await prisma.answer.create({
      data: {
        questionId: input.questionId,
        userId: req.user!.userId,
        body: input.body,
      },
    });
    return res.status(201).json({ success: true, data: answer });
  } catch (error) {
    next(error);
  }
});

// ================= MESSAGES & CHAT =================

router.get("/messages", requireAuth, async (req, res, next) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId: req.user!.userId } },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, role: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return res.json({ success: true, data: conversations });
  } catch (error) {
    next(error);
  }
});

router.post("/messages", requireAuth, async (req, res, next) => {
  try {
    const { recipientId, conversationId, body } = req.body;
    const senderId = req.user!.userId;

    if (!body || typeof body !== "string") {
      throw new ApiError("Message body is required.", 400);
    }

    let convId = conversationId;
    if (!convId && recipientId) {
      const existing = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: senderId } } },
            { participants: { some: { userId: recipientId } } },
          ],
        },
      });

      if (existing) {
        convId = existing.id;
      } else {
        const created = await prisma.conversation.create({
          data: {
            participants: {
              create: [{ userId: senderId }, { userId: recipientId }],
            },
          },
        });
        convId = created.id;
      }
    }

    if (!convId) throw new ApiError("Recipient or conversation required.", 400);

    const message = await prisma.message.create({
      data: {
        conversationId: convId,
        senderId,
        body,
      },
    });

    await prisma.conversation.update({
      where: { id: convId },
      data: { updatedAt: new Date() },
    });

    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
});

router.get("/messages/:conversationId", requireAuth, async (req, res, next) => {
  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: req.params.conversationId as string,
        participants: { some: { userId: req.user!.userId } },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, role: true },
            },
          },
        },
        messages: {
          include: {
            sender: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) throw new ApiError("Conversation not found.", 404);
    return res.json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
});

// ================= NOTIFICATIONS =================

router.get("/notifications", requireAuth, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return res.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
});

router.patch("/notifications", requireAuth, async (req, res, next) => {
  try {
    const id = req.body.id;
    if (typeof id === "string") {
      await prisma.notification.updateMany({
        where: { id, userId: req.user!.userId },
        data: { isRead: true },
      });
    } else {
      await prisma.notification.updateMany({
        where: { userId: req.user!.userId, isRead: false },
        data: { isRead: true },
      });
    }
    return res.json({ success: true, message: "Marked as read." });
  } catch (error) {
    next(error);
  }
});

// ================= CONTACT & NEWSLETTER =================

router.post("/contact", async (req, res, next) => {
  try {
    const input = contactSchema.parse(req.body);
    const msg = await prisma.contactMessage.create({
      data: input,
    });
    return res.status(201).json({
      success: true,
      message: "Your message has been received.",
      data: msg,
    });
  } catch (error) {
    next(error);
  }
});

router.post("/newsletter", async (req, res, next) => {
  try {
    const input = newsletterSchema.parse(req.body);
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      return res.json({
        success: true,
        isDuplicate: true,
        message:
          "This email is already subscribed to the BookHand newsletter.",
      });
    }

    await prisma.newsletterSubscription.create({
      data: { email: input.email },
    });

    return res.json({
      success: true,
      isDuplicate: false,
      message:
        "You are subscribed. Look out for new arrivals, offers, and reading picks.",
    });
  } catch (error) {
    next(error);
  }
});

export default router;
