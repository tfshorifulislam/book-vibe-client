import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  ChevronRight,
  CircleCheck,
  Globe2,
  Package,
  Star,
  Store,
} from "lucide-react";

import { BookCard } from "@/components/shared/BookCard";
import { BookCover } from "@/components/shared/BookCover";
import { StarRating } from "@/components/shared/StarRating";
import {
  BookQuestionForm,
  BookReviewForm,
} from "@/components/store/community-forms";
import { PurchasePanel } from "@/components/store/purchase-panel";
import { getBookBySlug, getRelatedBooks } from "@/lib/data/books";
import {
  cn,
  formatDate,
  formatNumber,
  formatPrice,
  getConditionLabel,
  getStockLabel,
} from "@/lib/utils";
import type { Book } from "@/types/book";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) return { title: "Book not found" };
  return {
    title: book.title,
    description: book.description.slice(0, 160),
  };
}

export default async function BookDetailPage({ params }: Props) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) notFound();

  const related = await getRelatedBooks({
    id: book.id,
    categoryId: book.categoryId,
    shopId: book.shopId,
  });
  const rating =
    book.ratingCount > 0
      ? Math.round((book.ratingSum / book.ratingCount) * 10) / 10
      : 0;
  const discount = book.originalPrice
    ? Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100)
    : 0;
  const coverBook: Book = {
    id: book.id,
    slug: book.slug,
    title: book.title,
    author: book.author.name,
    publisher: book.publisher?.name,
    coverImage: book.coverImage ?? undefined,
    coverTone: book.coverTone,
    price: book.price,
    originalPrice: book.originalPrice ?? undefined,
    condition: book.condition as Book["condition"],
    stock: book.stock,
    sellerName: book.shop.name,
    sellerId: book.shop.owner.id,
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground"
      >
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="size-3" />
        <Link href="/books" className="hover:text-primary">
          Books
        </Link>
        <ChevronRight className="size-3" />
        <Link
          href={`/categories/${book.category.slug}`}
          className="hover:text-primary"
        >
          {book.category.name}
        </Link>
        <ChevronRight className="size-3" />
        <span className="line-clamp-1 text-foreground">{book.title}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[320px_1fr]">
        <div>
          <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
            <BookCover book={coverBook} priority sizes="320px" />
          </div>
          <div className="mt-4 grid gap-2 rounded-xl border border-border bg-card p-4 text-sm">
            <div className="flex items-start gap-2">
              <CircleCheck className="mt-0.5 size-4 text-success" />
              <div>
                <p className="font-medium">Buyer protection</p>
                <p className="text-xs text-muted-foreground">
                  Report material condition issues within 7 days.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Package className="mt-0.5 size-4 text-primary" />
              <div>
                <p className="font-medium">Delivery across Bangladesh</p>
                <p className="text-xs text-muted-foreground">
                  Tracked delivery from the seller&apos;s shop.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
              {book.listingType === "USED" ? "Used book" : "New book"}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium">
              {getConditionLabel(book.condition as Book["condition"])}
            </span>
            {book.isBestSeller ? (
              <span className="rounded-full bg-secondary/20 px-2.5 py-1 text-[11px] font-semibold">
                Best seller
              </span>
            ) : null}
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight text-balance sm:text-3xl lg:text-4xl">
            {book.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            by{" "}
            <Link
              href={`/authors/${book.author.slug}`}
              className="font-medium text-primary hover:underline"
            >
              {book.author.name}
            </Link>
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <StarRating rating={rating} reviewCount={book.ratingCount} />
            <span className="text-xs text-muted-foreground">
              {formatNumber(book.salesCount)} sold
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-end gap-3">
            <span className="text-3xl font-bold tracking-tight">
              {formatPrice(book.price)}
            </span>
            {book.originalPrice && book.originalPrice > book.price ? (
              <>
                <span className="text-base text-muted-foreground line-through">
                  {formatPrice(book.originalPrice)}
                </span>
                <span className="rounded-md bg-secondary/20 px-2 py-1 text-xs font-semibold text-secondary-foreground">
                  Save {discount}%
                </span>
              </>
            ) : null}
          </div>
          <p
            className={cn(
              "mt-2 text-sm font-medium",
              book.stock <= 0
                ? "text-destructive"
                : book.stock <= 3
                  ? "text-warning"
                  : "text-success",
            )}
          >
            {getStockLabel(book.stock)}
          </p>

          <div className="mt-5 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link
                href={`/shops/${book.shop.slug}`}
                className="flex items-center gap-2 text-sm font-semibold hover:text-primary"
              >
                <Store className="size-4 text-primary" />
                {book.shop.name}
              </Link>
              <span className="text-xs text-muted-foreground">
                Sold by {book.shop.owner.name}
              </span>
            </div>
            <div className="mt-4">
              <PurchasePanel
                bookId={book.id}
                slug={book.slug}
                stock={book.stock}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-3 rounded-xl border border-border bg-card p-4 text-sm sm:grid-cols-2">
            <Detail
              icon={<BookOpen className="size-4" />}
              label="Publisher"
              value={book.publisher?.name ?? "—"}
            />
            <Detail
              icon={<Globe2 className="size-4" />}
              label="Language"
              value={book.language}
            />
            <Detail
              icon={<BookOpen className="size-4" />}
              label="Edition"
              value={book.edition ?? "—"}
            />
            <Detail
              icon={<BookOpen className="size-4" />}
              label="Pages"
              value={book.pageCount ? formatNumber(book.pageCount) : "—"}
            />
            <Detail
              icon={<BookOpen className="size-4" />}
              label="ISBN"
              value={book.isbn ?? "—"}
            />
            <Detail
              icon={<BookOpen className="size-4" />}
              label="Listed"
              value={
                formatDate(book.listedAt.toISOString().slice(0, 10)) ?? "—"
              }
            />
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-lg font-bold">About this book</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
              {book.description.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Customer reviews</h2>
              <span className="flex items-center gap-1 text-sm font-semibold">
                <Star className="size-4 fill-secondary text-secondary" />
                {rating || "—"} / 5
              </span>
            </div>

            {book.reviews.length ? (
              <ul className="mt-4 divide-y divide-border">
                {book.reviews.map((review) => (
                  <li key={review.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold">
                        {review.title || "Verified reader"}
                      </p>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {review.user.name} ·{" "}
                      {formatDate(review.createdAt.toISOString().slice(0, 10))}
                      {review.isVerified ? " · Verified purchase" : ""}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {review.body}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No reviews yet. Be the first to share your thoughts.
              </p>
            )}

            <div className="mt-5">
              <BookReviewForm bookId={book.id} />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="text-lg font-bold">Questions & answers</h2>
            {book.questions.length ? (
              <ul className="mt-4 space-y-4">
                {book.questions.map((question) => (
                  <li key={question.id} className="rounded-lg bg-muted/40 p-3">
                    <p className="text-sm font-medium">{question.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Asked by {question.user.name}
                    </p>
                    {question.answers.length ? (
                      <ul className="mt-2 space-y-2 border-l-2 border-primary/30 pl-3">
                        {question.answers.map((answer) => (
                          <li key={answer.id}>
                            <p className="text-sm">{answer.body}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {answer.user.name}
                              {answer.user.role === "SELLER" ? " · Seller" : ""}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Awaiting an answer from the seller.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No questions yet. Ask the seller anything about this copy.
              </p>
            )}
            <div className="mt-5">
              <BookQuestionForm bookId={book.id} />
            </div>
          </section>
        </div>

        <aside>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-sm font-bold">More from this seller</h2>
            <div className="mt-3 space-y-3">
              {related.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={`/books/${item.slug}`}
                  className="flex gap-3 rounded-lg p-1 hover:bg-muted"
                >
                  <div className="w-14 shrink-0">
                    <BookCover book={item} sizes="56px" />
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-xs font-semibold">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.author}
                    </p>
                    <p className="mt-1 text-xs font-bold">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {related.length ? (
        <section className="mt-12">
          <h2 className="text-xl font-bold">You may also like</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((item) => (
              <BookCard key={item.id} book={item} showDetails />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-primary">{icon}</span>
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
