import Link from "next/link";
import { Eye, ShoppingBag } from "lucide-react";

import { prisma } from "@/lib/db";
import { formatCurrency, formatDateDisplay } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: { select: { id: true, title: true, quantity: true } },
      payment: { select: { provider: true, status: true } },
      shipment: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Orders Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor and oversee customer orders across all marketplace sellers.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground">
          <ShoppingBag className="size-4 text-primary" />
          <span>
            Total Orders:{" "}
            <strong className="text-foreground">{orders.length}</strong>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">Order Number</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Order Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const totalItems = order.items.reduce(
                  (acc, it) => acc + it.quantity,
                  0,
                );
                return (
                  <tr key={order.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDateDisplay(order.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">
                        {order.user.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {order.user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {totalItems} {totalItems === 1 ? "item" : "items"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-medium text-foreground">
                        {order.paymentMethod}
                      </div>
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase ${
                          order.paymentStatus === "PAID"
                            ? "bg-success/15 text-success"
                            : order.paymentStatus === "FAILED"
                              ? "bg-destructive/15 text-destructive"
                              : "bg-warning/15 text-warning"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                          order.status === "DELIVERED"
                            ? "bg-success/15 text-success"
                            : order.status === "CANCELLED"
                              ? "bg-destructive/15 text-destructive"
                              : order.status === "SHIPPED"
                                ? "bg-secondary text-secondary-foreground"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 rounded bg-secondary/15 px-2.5 py-1 text-xs font-medium text-secondary-foreground hover:bg-secondary/25"
                      >
                        <Eye className="size-3.5" /> Details
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
