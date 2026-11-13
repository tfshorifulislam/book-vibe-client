import type { Metadata } from "next";

import { EmptyPanel } from "@/components/dashboard/empty-panel";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Customers | Seller Workspace" };

export default async function SellerCustomersPage() {
  const user = await requireRole("seller");

  const orderItems = await prisma.orderItem.findMany({
    where: { sellerId: user.id },
    include: {
      order: {
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Group by customer user id
  const customerMap = new Map<
    string,
    {
      id: string;
      name: string;
      email: string;
      phone?: string | null;
      orderCount: number;
      totalSpent: number;
      lastOrderDate: Date;
    }
  >();

  for (const item of orderItems) {
    const u = item.order.user;
    const existing = customerMap.get(u.id);
    const itemTotal = item.price * item.quantity;
    if (existing) {
      existing.orderCount += 1;
      existing.totalSpent += itemTotal;
      if (item.createdAt > existing.lastOrderDate) {
        existing.lastOrderDate = item.createdAt;
      }
    } else {
      customerMap.set(u.id, {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        orderCount: 1,
        totalSpent: itemTotal,
        lastOrderDate: item.createdAt,
      });
    }
  }

  const customers = Array.from(customerMap.values());

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Audience"
        title="Store Customers"
        description="View readers and book buyers who have placed orders with your shop."
      />

      {customers.length ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Total Value</th>
                <th className="px-4 py-3 text-right">Latest Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-semibold text-foreground">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.phone || "N/A"}</td>
                  <td className="px-4 py-3 text-xs font-medium">{c.orderCount} orders</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(c.totalSpent)}</td>
                  <td className="px-4 py-3 text-xs text-right text-muted-foreground">
                    {c.lastOrderDate.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyPanel
          title="No customers yet"
          description="Customers who purchase books from your shop will appear here."
        />
      )}
    </div>
  );
}
