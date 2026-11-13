import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";

import { EmptyPanel } from "@/components/dashboard/empty-panel";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Customer Reviews | Seller Workspace" };

export default async function SellerReviewsPage() {
  const user = await requireRole("seller");
  const shop = await prisma.shop.findUnique({ where: { ownerId: user.id } });

  const reviews = shop
    ? await prisma.review.findMany({
        where: { book: { shopId: shop.id } },
        include: {
          book: { select: { title: true, slug: true } },
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Feedback"
        title="Book Reviews"
        description="Reader feedback and ratings left on your published books."
      />

      {reviews.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-border bg-card p-5 space-y-2">
              <div className="flex items-center justify-between">
                <Link
                  href={`/books/${r.book.slug}`}
                  className="font-semibold text-foreground hover:text-primary line-clamp-1 text-sm"
                >
                  {r.book.title}
                </Link>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="size-3.5 fill-current" />
                  <span>{r.rating}.0</span>
                </div>
              </div>

              {r.title ? <p className="text-xs font-semibold text-foreground">{r.title}</p> : null}
              <p className="text-xs text-muted-foreground">{r.body}</p>

              <div className="flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                <span>By {r.user.name}</span>
                <span>{formatDate(r.createdAt.toISOString().slice(0, 10))}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyPanel
          title="No reviews yet"
          description="Customer reviews for your books will appear here once verified buyers share feedback."
        />
      )}
    </div>
  );
}
