import Link from "next/link";
import { HelpCircle } from "lucide-react";

import { prisma } from "@/lib/db";
import { formatDateDisplay } from "@/lib/utils";
import { ModerationButton } from "@/components/admin/moderation-actions";


export default async function AdminQuestionsPage() {
  const questions = await prisma.question.findMany({
    include: {
      user: { select: { name: true, email: true } },
      book: { select: { title: true, slug: true } },
      answers: { select: { id: true, body: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Questions Moderation</h1>
          <p className="text-sm text-muted-foreground">
            Monitor and moderate buyer book questions and seller replies.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card px-3 py-1.5 rounded-lg border border-border">
          <HelpCircle className="size-4 text-primary" />
          <span>Total Questions: <strong className="text-foreground">{questions.length}</strong></span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Book</th>
              <th className="px-4 py-3">Asked By</th>
              <th className="px-4 py-3">Question</th>
              <th className="px-4 py-3">Answers</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {questions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No questions asked yet.
                </td>
              </tr>
            ) : (
              questions.map((q) => (
                <tr key={q.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/books/${q.book.slug}`}
                      className="font-medium text-foreground hover:text-primary transition-colors max-w-xs block truncate"
                    >
                      {q.book.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{q.user.name}</div>
                    <div className="text-xs text-muted-foreground">{q.user.email}</div>
                  </td>
                  <td className="px-4 py-3 max-w-sm">
                    <p className="text-xs text-foreground line-clamp-2">{q.body}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {q.answers.length} {q.answers.length === 1 ? "answer" : "answers"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                        q.isApproved ? "bg-success/15 text-success" : "bg-warning/15 text-warning"
                      }`}
                    >
                      {q.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDateDisplay(q.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      {q.isApproved ? (
                        <ModerationButton type="question" id={q.id} action="reject" />
                      ) : (
                        <ModerationButton type="question" id={q.id} action="approve" />
                      )}
                      <ModerationButton type="question" id={q.id} action="delete" />
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
