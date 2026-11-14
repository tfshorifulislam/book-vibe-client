import type { Metadata } from "next";

import { ReviewsClient } from "@/components/buyer/reviews-client";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "My reviews" };

export default async function ReviewsPage() {
  const user = await requireRole("buyer");
  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    include: { book: { select: { id: true, title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  const initial = reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    title: review.title,
    body: review.body,
    isVerified: review.isVerified,
    isApproved: review.isApproved,
    createdAt: review.createdAt.toISOString(),
    book: review.book,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="My reviews"
        description={`${initial.length} review${initial.length === 1 ? "" : "s"} written`}
      />
      <ReviewsClient initial={initial} />
    </div>
  );
}
