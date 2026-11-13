import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { BookForm } from "@/components/seller/book-form";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Add New Book | Seller Workspace" };

export default async function CreateBookPage() {
  await requireRole("seller");

  const [authors, categories, publishers] = await Promise.all([
    prisma.author.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.publisher.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalogue"
        title="Add New Book"
        description="Publish a new or second-hand book to the BookHand marketplace."
      />
      <BookForm authors={authors} categories={categories} publishers={publishers} />
    </div>
  );
}
