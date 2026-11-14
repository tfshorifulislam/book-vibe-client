import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Heart,
  Package,
  Receipt,
  ShoppingCart,
  Wallet,
} from "lucide-react";

import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { EmptyPanel } from "@/components/dashboard/empty-panel";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { BookCard } from "@/components/shared/BookCard";
import { requireRole } from "@/lib/auth/session";
import { getBookCards } from "@/lib/data/books";
import { prisma } from "@/lib/db";
import { formatDate, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Buyer dashboard" };

export default function BuyerDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <BuyerDashboardContent />
    </Suspense>
  );
}

async function BuyerDashboardContent() {
  await connection();
  const user = await requireRole("buyer");
  const [orders, wishlistCount, cartCount, unread, notifications, recommended] =
    await Promise.all([
      prisma.order.findMany({
        where: { userId: user.id },
        include: { items: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.wishlistItem.count({ where: { wishlist: { userId: user.id } } }),
      prisma.cartItem.aggregate({
        where: { cart: { userId: user.id } },
        _sum: { quantity: true },
      }),
      prisma.notification.count({ where: { userId: user.id, isRead: false } }),
      prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      getBookCards({ featured: true, limit: 4, sort: "popular" }),
    ]);

  const spent = await prisma.order.aggregate({
    where: { userId: user.id, status: { notIn: ["CANCELLED", "REFUNDED"] } },
    _sum: { total: true },
  });
  const activeOrders = orders.filter((order) =>
    ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"].includes(order.status),
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Buyer workspace"
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Track orders, manage your wishlist, and find your next read."
        actions={
          <Link
            href="/books"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
          >
            Browse books <ArrowRight className="size-3.5" />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active orders"
          value={activeOrders}
          hint={`${orders.length} recent orders`}
          icon={<Package className="size-4" />}
        />
        <StatCard
          label="Wishlist"
          value={wishlistCount}
          hint="Saved books"
          icon={<Heart className="size-4" />}
        />
        <StatCard
          label="Cart items"
          value={cartCount._sum.quantity ?? 0}
          hint="Ready to checkout"
          icon={<ShoppingCart className="size-4" />}
        />
        <StatCard
          label="Total spent"
          value={formatPrice(spent._sum.total ?? 0)}
          hint="Excluding cancelled orders"
          icon={<Wallet className="size-4" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold">Recent orders</h2>
            <Link
              href="/buyer/orders"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {orders.length ? (
            <div className="mt-4 divide-y divide-border">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/buyer/orders/${order.id}`}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Receipt className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {order.orderNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.items.length} item
                      {order.items.length === 1 ? "" : "s"} ·{" "}
                      {formatDate(
                        (typeof order.createdAt === "string"
                          ? order.createdAt
                          : (order.createdAt?.toISOString?.() ?? "")
                        ).slice(0, 10)
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatPrice(order.total)}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyPanel
                title="No orders yet"
                description="Your orders will appear here after your first purchase."
                action={{ label: "Start shopping", href: "/books" }}
              />
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-bold">
              <Bell className="size-4" /> Notifications
              {unread > 0 ? (
                <span className="rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                  {unread}
                </span>
              ) : null}
            </h2>
            <Link
              href="/buyer/notifications"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          {notifications.length ? (
            <ul className="mt-4 space-y-3">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className="rounded-lg bg-muted/50 p-3"
                >
                  <p className="text-sm font-medium">{notification.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {notification.message}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              You have no notifications yet.
            </p>
          )}
        </section>
      </div>

      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-bold">
            <BookOpen className="size-4" /> Recommended for you
          </h2>
          <Link
            href="/featured-books"
            className="text-xs font-medium text-primary hover:underline"
          >
            See more
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {recommended.books.map((book) => (
            <BookCard key={book.id} book={book} showDetails />
          ))}
        </div>
      </section>
    </div>
  );
}
