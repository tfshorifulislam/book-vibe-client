import { Suspense } from "react";
import { connection } from "next/server";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Package } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { OrderStatusUpdater } from "@/components/seller/order-status-updater";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Manage Order | Seller Workspace" };

export default function SellerOrderDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <SellerOrderDetailContent {...props} />
    </Suspense>
  );
}

async function SellerOrderDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const user = await requireRole("seller");
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      items: { some: { sellerId: user.id } },
    },
    include: {
      items: {
        where: { sellerId: user.id },
        include: { book: true },
      },
      user: { select: { name: true, email: true, phone: true } },
      payment: true,
      shipment: true,
    },
  });

  if (!order) {
    notFound();
  }

  const address = (() => {
    try {
      return JSON.parse(order.addressSnapshot);
    } catch {
      return {
        recipientName: order.user.name,
        phone: order.user.phone,
        district: "",
        city: "",
        area: order.addressSnapshot,
        postalCode: "",
        instructions: "",
      };
    }
  })();

  const sellerSubtotal = order.items.reduce(
    (sum, i) => sum + i.price * i.quantity,
    0,
  );

  return (
    <div className="space-y-6">
      <Link
        href="/seller/orders"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to Orders
      </Link>

      <PageHeader
        eyebrow={`Order ${order.orderNumber}`}
        title="Fulfillment Details"
        description={`Placed on ${formatDate(order.createdAt.toISOString().slice(0, 10))} · Payment ${order.paymentMethod}`}
        actions={
          <StatusBadge status={order.status} className="px-3 py-1 text-sm" />
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        <div className="space-y-6">
          {/* Order Items */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Package className="size-4" /> Ordered Books (Your Shop)
            </h2>
            <div className="mt-4 divide-y divide-border">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <Link
                      href={`/books/${item.book?.slug ?? ""}`}
                      target="_blank"
                      className="line-clamp-1 font-medium text-foreground hover:text-primary"
                    >
                      {item.book?.title ?? "Unknown Book"}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Condition: {item.book?.condition ?? "Standard"} · Unit:{" "}
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
              <span className="font-medium text-muted-foreground">
                Your Shop Total
              </span>
              <span className="text-lg font-bold text-foreground">
                {formatPrice(sellerSubtotal)}
              </span>
            </div>
          </div>

          {/* Delivery & Recipient */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <MapPin className="size-4" /> Recipient & Delivery Address
            </h2>
            <div className="mt-3 space-y-1 text-sm">
              <p className="font-semibold text-foreground">
                {address?.recipientName || order.user.name}
              </p>
              <p className="text-muted-foreground">
                Phone: {address?.phone || order.user.phone || "N/A"}
              </p>
              <p className="text-muted-foreground">
                {[address?.area, address?.city, address?.district]
                  .filter(Boolean)
                  .join(", ")}
                {address?.postalCode ? ` - ${address.postalCode}` : ""}
              </p>
              {address?.instructions ? (
                <p className="mt-2 rounded bg-muted p-2 text-xs text-muted-foreground italic">
                  Note: {address.instructions}
                </p>
              ) : null}
            </div>

            {order.shipment ? (
              <div className="mt-4 space-y-1 rounded-lg border border-border bg-muted/40 p-3 text-xs">
                <p className="font-semibold text-foreground">
                  Carrier: {order.shipment.carrier ?? "Standard"}
                </p>
                {order.shipment.trackingNumber ? (
                  <p className="font-mono font-bold text-primary">
                    Tracking: {order.shipment.trackingNumber}
                  </p>
                ) : null}
                <p className="text-muted-foreground">
                  Shipment status: {order.shipment.status}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Status updater sidebar */}
        <div>
          <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
        </div>
      </div>
    </div>
  );
}
