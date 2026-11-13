import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";

import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateDisplay } from "@/lib/utils";
import { PrintButton } from "@/components/buyer/print-button";

export const metadata: Metadata = { title: "Order Invoice | BookHand" };

type Props = { params: Promise<{ id: string }> };

export default async function InvoicePage({ params }: Props) {
  const user = await requireUser();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: true,
      payment: true,
      shipment: true,
    },
  });

  if (!order) notFound();

  // Security authorization: only the order's owner or admin can access
  if (order.userId !== user.id && user.role !== "admin") {
    notFound();
  }

  let address: Record<string, string | undefined> = {};
  try {
    address = JSON.parse(order.addressSnapshot);
  } catch {
    address = {};
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Action Bar (hidden on print) */}
      <div className="mx-auto mb-6 flex max-w-3xl items-center justify-between print:hidden">
        <Link
          href={`/buyer/orders/${order.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to Order
        </Link>

        <PrintButton />
      </div>

      {/* Printable Invoice Card */}
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-12 print:border-none print:p-0 print:shadow-none">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground">
              <BookOpen className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                BookHand
              </h1>
              <p className="text-xs text-muted-foreground">
                Premier Books Marketplace · Bangladesh
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-block font-mono text-xs font-bold tracking-wider text-primary uppercase">
              INVOICE / RECEIPT
            </span>
            <div className="text-lg font-bold text-foreground">
              INV-{order.orderNumber}
            </div>
            <div className="text-xs text-muted-foreground">
              Date: {formatDateDisplay(order.createdAt, { includeTime: true })}
            </div>
          </div>
        </div>

        {/* Billed To & Order Details */}
        <div className="grid grid-cols-1 gap-6 border-b border-border py-6 text-sm sm:grid-cols-2">
          <div>
            <h2 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Billed & Delivered To
            </h2>
            <div className="font-semibold text-foreground">
              {address.recipientName || order.user.name}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {order.user.email} ·{" "}
              {address.phone || order.user.phone || "No phone provided"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {[
                address.area,
                address.city,
                address.district,
                address.postalCode,
              ]
                .filter(Boolean)
                .join(", ")}
            </div>
            {address.instructions ? (
              <div className="mt-1 text-xs text-muted-foreground italic">
                Note: {address.instructions}
              </div>
            ) : null}
          </div>

          <div className="space-y-1 sm:text-right">
            <h2 className="mb-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Order Coordinates
            </h2>
            <div className="text-xs">
              <span className="text-muted-foreground">Order #: </span>
              <span className="font-semibold text-foreground">
                {order.orderNumber}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">Payment Method: </span>
              <span className="font-semibold text-foreground">
                {order.paymentMethod}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">Payment Status: </span>
              <span
                className={`font-semibold uppercase ${
                  order.paymentStatus === "PAID"
                    ? "text-success"
                    : "text-warning"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">Delivery Status: </span>
              <span className="font-semibold text-foreground uppercase">
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="border-b border-border py-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold text-muted-foreground uppercase">
                <th className="pb-3">Book Description</th>
                <th className="pb-3 text-center">Qty</th>
                <th className="pb-3 text-right">Unit Price</th>
                <th className="pb-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3">
                    <div className="font-medium text-foreground">
                      {item.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      by {item.author}
                    </div>
                  </td>
                  <td className="py-3 text-center text-muted-foreground">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right text-muted-foreground">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="py-3 text-right font-medium text-foreground">
                    {formatCurrency(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary */}
        <div className="flex justify-end pt-6">
          <div className="w-full space-y-2 text-sm sm:w-64">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery Shipping</span>
              <span>{formatCurrency(order.shipping)}</span>
            </div>
            {order.discount > 0 ? (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
              <span>Grand Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          <p>
            Thank you for choosing BookHand — Your Trusted Books Marketplace.
          </p>
          <p className="mt-1">
            For support inquiries, contact support@bookhand.com or visit
            https://bookhand.com/help
          </p>
        </div>
      </div>
    </div>
  );
}
