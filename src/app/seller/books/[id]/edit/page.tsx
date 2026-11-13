import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { BookForm } from "@/components/seller/book-form";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Edit Book | Seller Workspace" };

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("seller");
  const { id } = await params;

  const [book, authors, categories, publishers] = await Promise.all([
    prisma.book.findFirst({
      where: { id, shop: { ownerId: user.id } },
    }),
    prisma.author.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.publisher.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!book) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalogue"
        title={`Edit "${book.title}"`}
        description="Update pricing, stock levels, condition, and details for this book."
      />
      <BookForm
        initial={book}
        authors={authors}
        categories={categories}
        publishers={publishers}
      />
    </div>
  );
}
