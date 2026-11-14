import { Suspense } from "react";
import { connection } from "next/server";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CircleCheck,
  Clock,
  FileText,
  MapPin,
  Package,
  Receipt,
  Truck,
} from "lucide-react";

import { CancelOrderButton } from "@/components/buyer/order-actions";
import {
  DisputeRequestModal,
  RefundRequestModal,
} from "@/components/buyer/refund-dispute-actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { requireRole } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };
export const metadata: Metadata = { title: "Order details" };

const TIMELINE = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function BuyerOrderDetailPage(props: Props) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <BuyerOrderDetailContent {...props} />
    </Suspense>
  );
}

async function BuyerOrderDetailContent({ params }: Props) {
  await connection();
  const user = await requireRole("buyer");
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: {
      items: true,
      payment: true,
      shipment: true,
      refunds: true,
      disputes: true,
    },
  });
  if (!order) notFound();

  const address = JSON.parse(order.addressSnapshot) as Record<
    string,
    string | undefined
  >;
  const currentIndex = TIMELINE.indexOf(order.status);
  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Order ${order.orderNumber}`}
        description={`Placed ${formatDate(order.createdAt.toISOString().slice(0, 10))}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={order.status} />
            <Link
              href={`/buyer/orders/${order.id}/invoice`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <FileText className="size-3.5" /> View Invoice
            </Link>
            {canCancel ? <CancelOrderButton orderId={order.id} /> : null}
            {order.status === "DELIVERED" || order.refunds.length > 0 ? (
              <RefundRequestModal
                orderId={order.id}
                orderTotal={order.total}
                existingRefund={order.refunds[0] ?? null}
              />
            ) : null}
            <DisputeRequestModal
              orderId={order.id}
              existingDispute={order.disputes[0] ?? null}
            />
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <Package className="size-4" /> Items
            </h2>
            <ul className="mt-4 divide-y divide-border">
              {order.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span
                    className={`book-cover-tone-${item.coverTone ?? 1} flex size-12 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold text-on-brand`}
                  >
                    {item.title.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.author} · Qty {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    {order.status === "DELIVERED" && item.bookId ? (
                      <Link
                        href={`/books/${item.bookId}`}
                        className="text-[11px] text-primary hover:underline"
                      >
                        Review book
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatPrice(order.subtotal)}</dd>
              </div>
              {order.discount > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Discount</dt>
                  <dd className="text-success">
                    −{formatPrice(order.discount)}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>{order.shipping ? formatPrice(order.shipping) : "Free"}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd>{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <Truck className="size-4" /> Delivery
            </h2>
            <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <p className="font-medium">{address.recipientName}</p>
                <p className="text-muted-foreground">{address.phone}</p>
                <p className="mt-1 text-muted-foreground">
                  {address.area}, {address.city}, {address.district}{" "}
                  {address.postalCode}
                </p>
                {address.instructions ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Note: {address.instructions}
                  </p>
                ) : null}
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="flex items-center gap-1 text-xs font-medium">
                  <Truck className="size-3.5" /> Shipment status
                </p>
                <p className="mt-1 font-semibold">
                  {order.shipment?.status ?? "Processing"}
                </p>
                {order.shipment?.carrier ? (
                  <p className="text-xs text-muted-foreground">
                    {order.shipment.carrier}
                  </p>
                ) : null}
                {order.shipment?.trackingNumber ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tracking: {order.shipment.trackingNumber}
                  </p>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <Receipt className="size-4" /> Payment
            </h2>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span>
                {order.paymentMethod} ·{" "}
                {formatPrice(order.payment?.amount ?? order.total)}
              </span>
              <StatusBadge status={order.paymentStatus} />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <Clock className="size-4" /> Order timeline
            </h2>
            <ol className="mt-4 space-y-4">
              {TIMELINE.map((status, index) => {
                const done = currentIndex >= index;
                return (
                  <li key={status} className="flex gap-3">
                    <span
                      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {done ? (
                        <CircleCheck className="size-3" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-current" />
                      )}
                    </span>
                    <div>
                      <p
                        className={`text-sm ${done ? "font-medium" : "text-muted-foreground"}`}
                      >
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </p>
                      {status === order.status ? (
                        <p className="text-xs text-primary">Current status</p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <MapPin className="size-4" /> Need help?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Report a problem with this order or contact the seller.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                href="/contact"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-border text-sm font-medium hover:bg-muted"
              >
                Contact support
              </Link>
              <Link
                href="/buyer/messages"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground"
              >
                Message seller
              </Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
