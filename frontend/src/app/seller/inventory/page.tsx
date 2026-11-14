import type { Metadata } from "next";

import { PageHeader } from "@/components/dashboard/page-header";
import { InventoryManager } from "@/components/seller/inventory-manager";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Inventory Management | Seller Workspace",
};

export default async function SellerInventoryPage() {
  const user = await requireRole("seller");
  const shop = await prisma.shop.findUnique({ where: { ownerId: user.id } });

  const books = shop
    ? await prisma.book.findMany({
        where: { shopId: shop.id },
        select: {
          id: true,
          slug: true,
          title: true,
          price: true,
          stock: true,
          lowStockAlert: true,
          condition: true,
          category: { select: { name: true } },
        },
        orderBy: { stock: "asc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Stock Control"
        title="Inventory Levels"
        description="Monitor book stock counts, receive low stock alerts, and make instant adjustments."
      />

      <InventoryManager initialBooks={books} />
    </div>
  );
}
