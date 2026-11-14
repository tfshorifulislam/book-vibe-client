import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Package, Shield, Truck, User } from "lucide-react";

import { prisma } from "@/lib/db";
import { formatCurrency, formatDateDisplay } from "@/lib/utils";
import { OrderStatusUpdater } from "@/components/seller/order-status-updater";

type Params = {
  params: Promise<{ id: string }>;
};

export default async function AdminOrderDetailPage({ params }: Params) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: {
          book: { select: { id: true, slug: true, title: true, author: true } },
          seller: { select: { id: true, name: true, email: true } },
        },
      },
      payment: true,
      shipment: true,
      refunds: true,
    },
  });

  if (!order) notFound();

  let address: Record<string, string> = {};
  try {
    address = JSON.parse(order.addressSnapshot);
  } catch {
    address = { address: order.addressSnapshot };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Order {order.orderNumber}
            </h1>
            <span
              className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                order.status === "DELIVERED"
                  ? "bg-success/15 text-success"
                  : order.status === "CANCELLED"
                    ? "bg-destructive/15 text-destructive"
                    : "bg-secondary text-secondary-foreground"
              }`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Placed on{" "}
            {formatDateDisplay(order.createdAt, { includeTime: true })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left col - Items & Pricing */}
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-4 rounded-xl border border-border bg-card p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Package className="size-5 text-primary" />
              Ordered Items ({order.items.length})
            </h2>

            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div>
                    <Link
                      href={item.book ? `/books/${item.book.slug}` : "#"}
                      className="font-medium text-foreground transition-colors hover:text-primary"
                    >
                      {item.title}
                    </Link>
                    <div className="text-xs text-muted-foreground">
                      by {item.author}
                    </div>
                    {item.seller ? (
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Seller:{" "}
                        <span className="font-medium text-foreground">
                          {item.seller.name}
                        </span>
                      </div>
                    ) : null}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.quantity} × {formatCurrency(item.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span>{formatCurrency(order.shipping)}</span>
              </div>
              {order.discount > 0 ? (
                <div className="flex justify-between text-success">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
                <span>Total Amount</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Payment & Shipment details */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Shield className="size-4 text-primary" /> Payment Information
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Method: </span>
                <span className="font-medium text-foreground">
                  {order.paymentMethod}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Status: </span>
                <span
                  className={`inline-block rounded px-1.5 py-0.5 text-xs font-semibold ${
                    order.paymentStatus === "PAID"
                      ? "bg-success/15 text-success"
                      : "bg-warning/15 text-warning"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>
              {order.payment?.transactionRef ? (
                <div className="text-xs text-muted-foreground">
                  Ref:{" "}
                  <span className="font-mono text-foreground">
                    {order.payment.transactionRef}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="space-y-2 rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Truck className="size-4 text-primary" /> Delivery & Shipment
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Carrier: </span>
                <span className="font-medium text-foreground">
                  {order.shipment?.carrier ?? "Standard Delivery"}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Tracking #: </span>
                <span className="font-mono text-xs text-foreground">
                  {order.shipment?.trackingNumber ?? "Not yet assigned"}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Shipment Status: </span>
                <span className="font-medium text-foreground">
                  {order.shipment?.status ?? "PENDING"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right col - Status Updater & Customer */}
        <div className="space-y-6">
          <OrderStatusUpdater
            orderId={order.id}
            currentStatus={order.status}
            apiPrefix="/api/admin/orders"
          />

          <div className="space-y-4 rounded-xl border border-border bg-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <User className="size-4 text-primary" /> Customer Info
            </h3>
            <div className="space-y-1 text-sm">
              <div className="font-medium text-foreground">
                {order.user.name}
              </div>
              <div className="text-xs text-muted-foreground">
                {order.user.email}
              </div>
              {order.user.phone ? (
                <div className="text-xs text-muted-foreground">
                  {order.user.phone}
                </div>
              ) : null}
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-card p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="size-4 text-primary" /> Delivery Address
            </h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="font-medium text-foreground">
                {address.name ?? order.user.name}
              </div>
              <div>{address.phone ?? order.user.phone}</div>
              <div>
                {address.street ?? address.address ?? "Standard Address"}
              </div>
              <div>
                {[address.city, address.division, address.postalCode]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
