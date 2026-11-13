import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";

import { EmptyPanel } from "@/components/dashboard/empty-panel";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "My orders" };

export default async function BuyerOrdersPage() {
  const user = await requireRole("buyer");
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true, shipment: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="My orders" description="Track purchases, download receipts, and manage cancellations." />
      {orders.length ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Package className="size-4" />
                  </span>
                  <div>
                    <Link href={`/buyer/orders/${order.id}`} className="font-semibold hover:text-primary">
                      {order.orderNumber}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Placed {formatDate(order.createdAt.toISOString().slice(0, 10))} · {order.items.length} item{order.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={order.status} />
                  <span className="text-sm font-bold">{formatPrice(order.total)}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                {order.items.slice(0, 3).map((item) => (
                  <span key={item.id} className="rounded-full bg-muted px-2 py-1">
                    {item.title} × {item.quantity}
                  </span>
                ))}
                {order.items.length > 3 ? <span className="rounded-full bg-muted px-2 py-1">+{order.items.length - 3} more</span> : null}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3 text-xs">
                <span className="text-muted-foreground">Payment: <strong className="text-foreground">{order.paymentMethod}</strong></span>
                {order.shipment?.trackingNumber ? <span className="text-muted-foreground">Tracking: <strong className="text-foreground">{order.shipment.trackingNumber}</strong></span> : null}
                <Link href={`/buyer/orders/${order.id}`} className="ml-auto font-medium text-primary hover:underline">View details</Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyPanel title="No orders yet" description="Books you buy will appear here with their delivery status." action={{ label: "Browse books", href: "/books" }} />
      )}
    </div>
  );
}
