import Link from "next/link";
import { MessageSquare, Star } from "lucide-react";

import { prisma } from "@/lib/db";
import { formatDateDisplay } from "@/lib/utils";
import { ModerationButton } from "@/components/admin/moderation-actions";


export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: {
      user: { select: { name: true, email: true } },
      book: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reviews Moderation</h1>
          <p className="text-sm text-muted-foreground">
            Approve, moderate, or remove customer book reviews and ratings.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-3 py-1.5 rounded-lg border border-border">
          <MessageSquare className="size-4 text-primary" />
          <span>Total Reviews: <strong className="text-foreground">{reviews.length}</strong></span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Book</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Review</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No reviews submitted yet.
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/books/${r.book.slug}`}
                      className="font-medium text-foreground hover:text-primary transition-colors max-w-xs block truncate"
                    >
                      {r.book.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{r.user.name}</div>
                    <div className="text-xs text-muted-foreground">{r.user.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 font-semibold text-warning text-xs">
                      <Star className="size-3.5 fill-current" />
                      <span>{r.rating}/5</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    {r.title ? <div className="font-medium text-foreground text-xs">{r.title}</div> : null}
                    <p className="text-xs text-muted-foreground line-clamp-2">{r.body}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                        r.isApproved ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                      }`}
                    >
                      {r.isApproved ? "Approved" : "Pending / Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDateDisplay(r.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      {r.isApproved ? (
                        <ModerationButton type="review" id={r.id} action="reject" />
                      ) : (
                        <ModerationButton type="review" id={r.id} action="approve" />
                      )}
                      <ModerationButton type="review" id={r.id} action="delete" />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
