import { Suspense } from "react";
import { connection } from "next/server";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyPanel } from "@/components/dashboard/empty-panel";
import { PageHeader } from "@/components/dashboard/page-header";
import { QuestionResponder } from "@/components/seller/question-responder";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Customer Questions | Seller Workspace",
};

export default function SellerQuestionsPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <SellerQuestionsContent />
    </Suspense>
  );
}

async function SellerQuestionsContent() {
  await connection();
  const user = await requireRole("seller");
  const shop = await prisma.shop.findUnique({ where: { ownerId: user.id } });

  const questions = shop
    ? await prisma.question.findMany({
        where: { book: { shopId: shop.id } },
        include: {
          book: { select: { title: true, slug: true } },
          user: { select: { name: true } },
          answers: {
            include: { user: { select: { name: true, role: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inquiries"
        title="Buyer Questions"
        description="Answer questions asked by readers about your books' edition, condition, and availability."
      />

      {questions.length ? (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className="space-y-3 rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between text-xs">
                <Link
                  href={`/books/${q.book.slug}`}
                  className="line-clamp-1 font-semibold text-primary hover:underline"
                >
                  Book: {q.book.title}
                </Link>
                <span className="text-muted-foreground">
                  {formatDate(q.createdAt.toISOString().slice(0, 10))}
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  {q.body}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Asked by {q.user.name}
                </p>
              </div>

              {q.answers.length ? (
                <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3 text-xs">
                  <p className="font-semibold text-foreground">Answers:</p>
                  {q.answers.map((a) => (
                    <div key={a.id} className="border-l-2 border-primary pl-2">
                      <p className="text-foreground">{a.body}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {a.user.name} ({a.user.role.toLowerCase()}) ·{" "}
                        {formatDate(a.createdAt.toISOString().slice(0, 10))}
                      </p>
                    </div>
                  ))}
                </div>
              ) : null}

              <QuestionResponder questionId={q.id} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyPanel
          title="No questions yet"
          description="When buyers ask questions on your book pages, they will appear here so you can answer."
        />
      )}
    </div>
  );
}
