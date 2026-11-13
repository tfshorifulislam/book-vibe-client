"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Archive,
  BarChart3,
  Bell,
  BookOpen,
  Boxes,
  Building2,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  FileText,
  Heart,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Percent,
  Receipt,
  RotateCcw,
  Settings,
  ShoppingBag,
  Star,
  Store,
  Tags,
  Truck,
  Users,
  Wallet,
  X,
  Menu,
  type LucideIcon,
} from "lucide-react";

import { cn, getInitials } from "@/lib/utils";
import type { User } from "@/types";

type NavItem = { label: string; href: string; icon: LucideIcon };
type NavGroup = { label: string; items: NavItem[] };

const BUYER_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/buyer/dashboard", icon: LayoutDashboard },
      { label: "Browse Books", href: "/books", icon: BookOpen },
    ],
  },
  {
    label: "Shopping",
    items: [
      { label: "My Orders", href: "/buyer/orders", icon: Package },
      { label: "Wishlist", href: "/buyer/wishlist", icon: Heart },
      { label: "Coupons", href: "/buyer/coupons", icon: Percent },
    ],
  },
  {
    label: "My Activity",
    items: [
      { label: "Reviews", href: "/buyer/reviews", icon: Star },
      { label: "Questions", href: "/buyer/questions", icon: HelpCircle },
      { label: "Messages", href: "/buyer/messages", icon: MessageCircle },
      { label: "Notifications", href: "/buyer/notifications", icon: Bell },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", href: "/buyer/profile", icon: Users },
      { label: "Addresses", href: "/buyer/addresses", icon: MapPin },
      { label: "Settings", href: "/buyer/settings", icon: Settings },
    ],
  },
];

const SELLER_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/seller/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { label: "My Books", href: "/seller/books", icon: BookOpen },
      { label: "Inventory", href: "/seller/inventory", icon: Boxes },
      { label: "My Shop", href: "/seller/shop", icon: Store },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Orders", href: "/seller/orders", icon: ClipboardList },
      { label: "Customers", href: "/seller/customers", icon: Users },
      { label: "Coupons", href: "/seller/coupons", icon: Percent },
      { label: "Earnings", href: "/seller/earnings", icon: Wallet },
      { label: "Payouts", href: "/seller/payouts", icon: CircleDollarSign },
    ],
  },
  {
    label: "Engagement",
    items: [
      { label: "Reviews", href: "/seller/reviews", icon: Star },
      { label: "Questions", href: "/seller/questions", icon: HelpCircle },
      { label: "Messages", href: "/seller/messages", icon: MessageCircle },
    ],
  },
  {
    label: "Account",
    items: [{ label: "Settings", href: "/seller/settings", icon: Settings }],
  },
];

const ADMIN_NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Sellers", href: "/admin/sellers", icon: Building2 },
      { label: "Shops", href: "/admin/shops", icon: Store },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { label: "Books", href: "/admin/books", icon: BookOpen },
      { label: "Categories", href: "/admin/categories", icon: Tags },
      { label: "Authors", href: "/admin/authors", icon: Users },
      { label: "Publishers", href: "/admin/publishers", icon: Building2 },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ClipboardList },
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
      { label: "Transactions", href: "/admin/transactions", icon: Receipt },
      { label: "Refunds", href: "/admin/refunds", icon: RotateCcw },
      { label: "Commissions", href: "/admin/commissions", icon: Percent },
      { label: "Payouts", href: "/admin/payouts", icon: Wallet },
      { label: "Coupons", href: "/admin/coupons", icon: Percent },
      { label: "Shipping", href: "/admin/settings/shipping", icon: Truck },
    ],
  },
  {
    label: "Moderation",
    items: [
      { label: "Reviews", href: "/admin/reviews", icon: Star },
      { label: "Questions", href: "/admin/questions", icon: HelpCircle },
      { label: "Disputes", href: "/admin/disputes", icon: LifeBuoy },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Banners", href: "/admin/banners", icon: Archive },
      { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
      { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
      { label: "Contact", href: "/admin/contact", icon: MessageCircle },
      { label: "Reports", href: "/admin/reports", icon: FileText },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function DashboardShell({
  user,
  role,
  children,
}: {
  user: User;
  role: "buyer" | "seller" | "admin";
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const nav = role === "admin" ? ADMIN_NAV : role === "seller" ? SELLER_NAV : BUYER_NAV;
  const roleLabel = role === "admin" ? "Administrator" : role === "seller" ? "Seller" : "Buyer";

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpen className="size-4" />
          </span>
          BookHand
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="ml-auto inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted lg:hidden"
          aria-label="Close menu"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt="" className="size-10 rounded-full object-cover" />
            ) : (
              getInitials(user.name)
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs capitalize text-muted-foreground">{roleLabel}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={`${roleLabel} dashboard`}>
        {nav.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="mb-1.5 px-2 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href.split("/").length > 2 && pathname.startsWith(`${item.href}/`));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ShoppingBag className="size-4" />
          View storefront
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
          <div className="sticky top-0 h-screen">{sidebar}</div>
        </aside>

        {open ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-overlay"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            />
            <div className="absolute inset-y-0 left-0 w-72 bg-card shadow-xl">{sidebar}</div>
          </div>
        ) : null}

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur sm:px-6">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-4" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {roleLabel} workspace
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Link
              href={role === "seller" ? "/seller/notifications" : role === "admin" ? "/admin/notifications" : "/buyer/notifications"}
              className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
            </Link>
          </header>
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
