import { Suspense } from "react";
import { connection } from "next/server";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "My questions" };

export default function QuestionsPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <QuestionsContent />
    </Suspense>
  );
}

async function QuestionsContent() {
  await connection();
  const user = await requireRole("buyer");
  const questions = await prisma.question.findMany({
    where: { userId: user.id },
    include: {
      book: { select: { title: true, slug: true } },
      answers: {
        include: { user: { select: { name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My questions"
        description={`${questions.length} question${questions.length === 1 ? "" : "s"} asked`}
      />
      {questions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center">
          <HelpCircle className="mx-auto size-8 text-muted-foreground" />
          <h2 className="mt-2 text-base font-semibold">No questions yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask sellers about editions, condition, or availability from any book
            page.
          </p>
          <Link
            href="/books"
            className="mt-4 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
          >
            Browse books
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {questions.map((question) => (
            <li
              key={question.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <Link
                href={`/books/${question.book.slug}`}
                className="text-sm font-semibold hover:text-primary"
              >
                {question.book.title}
              </Link>
              <p className="mt-1 text-sm">{question.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(question.createdAt).toLocaleDateString()}
              </p>
              {question.answers.length ? (
                <div className="mt-3 space-y-2 border-l-2 border-primary/20 pl-3">
                  {question.answers.map((answer) => (
                    <div key={answer.id}>
                      <p className="text-xs font-semibold">
                        {answer.user.name}{" "}
                        <span className="font-normal text-muted-foreground">
                          · {answer.user.role.toLowerCase()}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {answer.body}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">
                  Awaiting a seller response.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
