import { Suspense } from "react";
import { connection } from "next/server";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { Eye } from "lucide-react";

import { EmptyPanel } from "@/components/dashboard/empty-panel";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Seller Orders | BookHand" };

export default function SellerOrdersPage(props: { searchParams: Promise<{ status?: string }> }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <SellerOrdersContent {...props} />
    </Suspense>
  );
}

async function SellerOrdersContent({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await connection();
  const user = await requireRole("seller");
  const { status } = await searchParams;

  const orders = await prisma.order.findMany({
    where: {
      items: { some: { sellerId: user.id } },
      ...(status ? { status } : {}),
    },
    include: {
      items: {
        where: { sellerId: user.id },
        include: { book: { select: { title: true, coverImage: true } } },
      },
      user: { select: { name: true, email: true } },
      shipment: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const statuses = [
    { label: "All Orders", value: "" },
    { label: "Pending", value: "PENDING" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Processing", value: "PROCESSING" },
    { label: "Shipped", value: "SHIPPED" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fulfillment"
        title="Customer Orders"
        description="Process orders containing your books, print invoices, and update delivery tracking."
      />

      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Link
            key={s.value}
            href={
              s.value ? `/seller/orders?status=${s.value}` : "/seller/orders"
            }
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              (status ?? "") === s.value
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {orders.length ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-3">Order Number</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Your Subtotal</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => {
                const sellerSubtotal = o.items.reduce(
                  (sum, i) => sum + i.price * i.quantity,
                  0,
                );
                return (
                  <tr key={o.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono font-semibold text-primary">
                      {o.orderNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">
                        {o.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {o.user.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {o.items.length} {o.items.length === 1 ? "book" : "books"}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {formatPrice(sellerSubtotal)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <StatusBadge status={o.payment?.status ?? "UNPAID"} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(o.createdAt.toISOString().slice(0, 10))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/seller/orders/${o.id}`}
                        className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                      >
                        <Eye className="size-3.5" /> Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyPanel
          title="No orders found"
          description={
            status
              ? `No orders in "${status}" status.`
              : "You have not received any customer orders yet."
          }
        />
      )}
    </div>
  );
}
