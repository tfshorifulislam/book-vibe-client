import { prisma } from "@/lib/db";
import { PublisherManager } from "@/components/admin/publisher-manager";


export default async function AdminPublishersPage() {
  const publishers = await prisma.publisher.findMany({
    include: {
      _count: { select: { books: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Publishers Directory</h1>
          <p className="text-sm text-muted-foreground">
            Manage book publishers, publication companies, and public descriptions.
          </p>
        </div>
      </div>

      <PublisherManager initialPublishers={publishers} />
    </div>
  );
}
