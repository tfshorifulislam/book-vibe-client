import { prisma } from "@/lib/db";
import { CategoryManager } from "@/components/admin/category-manager";


export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      parent: { select: { name: true } },
      _count: { select: { books: true } },
    },
    orderBy: { order: "asc" },
  });

  const parentOptions = categories
    .filter((c) => !c.parentId)
    .map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Categories Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage public book categories, parent-child hierarchies, and display orders.
          </p>
        </div>
      </div>

      <CategoryManager
        initialCategories={categories}
        parentOptions={parentOptions}
      />
    </div>
  );
}
