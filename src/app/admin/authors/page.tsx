import { prisma } from "@/lib/db";
import { AuthorManager } from "@/components/admin/author-manager";


export default async function AdminAuthorsPage() {
  const authors = await prisma.author.findMany({
    include: {
      _count: { select: { books: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Authors Directory</h1>
          <p className="text-sm text-muted-foreground">
            Manage author profiles, biographies, and author public slugs.
          </p>
        </div>
      </div>

      <AuthorManager initialAuthors={authors} />
    </div>
  );
}
