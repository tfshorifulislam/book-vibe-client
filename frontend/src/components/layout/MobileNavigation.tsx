"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import {
  BookOpen,
  ChevronRight,
  Heart,
  MessageCircle,
  ShoppingCart,
  X,
} from "lucide-react";
import { Icon } from "@/components/shared/Icon";
import { NAV_LINKS } from "@/lib/constants";
import { cn, getInitials } from "@/lib/utils";
import type { Category } from "@/types/category";
import type { User } from "@/types";
import { ThemeToggle } from "./ThemeToggle";

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
  categories: Category[];
}

function getDashboard(role: User["role"]) {
  if (role === "seller") {
    return { href: "/seller/dashboard", label: "Seller Dashboard" };
  }
  if (role === "admin") {
    return { href: "/admin/dashboard", label: "Admin Dashboard" };
  }
  return { href: "/buyer/dashboard", label: "My Dashboard" };
}

export function MobileNavigation({
  isOpen,
  onClose,
  user,
  onLogout,
  categories,
}: MobileNavigationProps) {
  const pathname = usePathname();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const dashboard = user ? getDashboard(user.role) : null;

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <div
      id="mobile-navigation"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      className="fixed inset-0 z-50 lg:hidden"
    >
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="absolute inset-0 h-full w-full animate-in bg-overlay backdrop-blur-sm duration-200 fade-in-0"
      />

      <div
        ref={panelRef}
        className="absolute top-0 right-0 flex h-dvh w-[min(22rem,calc(100vw-2rem))] animate-in flex-col border-l border-navbar-border bg-navbar-background shadow-2xl duration-200 slide-in-from-right"
      >
        <div className="flex items-center justify-between border-b border-navbar-border px-4 py-3">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2 text-base font-bold tracking-tight text-navbar-foreground"
            aria-label="BookHand home"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-[image:var(--navbar-logo-background)] text-on-brand">
              <BookOpen className="size-4" aria-hidden="true" />
            </span>
            <span>BookHand</span>
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="inline-flex size-9 items-center justify-center rounded-full text-navbar-muted-foreground transition-colors hover:bg-navbar-hover hover:text-navbar-hover-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <nav aria-label="Mobile primary navigation">
            <ul className="space-y-1">
              {NAV_LINKS.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-navbar-active text-navbar-active-foreground"
                          : "text-navbar-foreground hover:bg-navbar-hover hover:text-navbar-hover-foreground",
                      )}
                    >
                      {item.label}
                      <ChevronRight
                        className="size-4 text-navbar-muted-foreground"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="mt-5 border-t border-navbar-border pt-4">
            <div className="flex items-center justify-between px-3">
              <p className="text-xs font-semibold tracking-[0.16em] text-navbar-muted-foreground uppercase">
                Categories
              </p>
              <Link
                href="/categories"
                onClick={onClose}
                className="text-xs font-medium text-navbar-active-foreground hover:underline"
              >
                View All
              </Link>
            </div>
            <ul className="mt-2 space-y-0.5">
              {categories.slice(0, 8).map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categories/${category.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-navbar-muted-foreground transition-colors hover:bg-navbar-hover hover:text-navbar-hover-foreground"
                  >
                    <Icon
                      name={category.icon}
                      className="size-4 text-primary"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {category.name}
                    </span>
                    <span className="text-[11px]">{category.bookCount}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-navbar-border px-3 pt-4">
            <span className="text-sm font-medium text-navbar-foreground">
              Appearance
            </span>
            <ThemeToggle />
          </div>
        </div>

        <div className="border-t border-navbar-border p-3">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-navbar-hover/60 px-3 py-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {getInitials(user.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-navbar-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-navbar-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              {user.role === "buyer" ? (
                <div className="grid grid-cols-3 gap-2">
                  <Link
                    href="/buyer/wishlist"
                    onClick={onClose}
                    className="flex flex-col items-center gap-1 rounded-lg border border-navbar-border py-2 text-[11px] font-medium text-navbar-foreground transition-colors hover:bg-navbar-hover"
                  >
                    <Heart className="size-4 text-primary" aria-hidden="true" />
                    Wishlist
                  </Link>
                  <Link
                    href="/buyer/cart"
                    onClick={onClose}
                    className="flex flex-col items-center gap-1 rounded-lg border border-navbar-border py-2 text-[11px] font-medium text-navbar-foreground transition-colors hover:bg-navbar-hover"
                  >
                    <ShoppingCart
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />
                    Cart
                  </Link>
                  <Link
                    href="/buyer/messages"
                    onClick={onClose}
                    className="flex flex-col items-center gap-1 rounded-lg border border-navbar-border py-2 text-[11px] font-medium text-navbar-foreground transition-colors hover:bg-navbar-hover"
                  >
                    <MessageCircle
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />
                    Messages
                  </Link>
                </div>
              ) : null}

              {user.role === "seller" ? (
                <Link
                  href="/seller/messages"
                  onClick={onClose}
                  className="flex h-9 items-center justify-center gap-1.5 rounded-lg border border-navbar-border text-sm font-medium text-navbar-foreground transition-colors hover:bg-navbar-hover"
                >
                  <MessageCircle
                    className="size-4 text-primary"
                    aria-hidden="true"
                  />
                  Messages
                </Link>
              ) : null}

              {dashboard ? (
                <Link
                  href={dashboard.href}
                  onClick={onClose}
                  className="flex h-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-primary-hover"
                >
                  {dashboard.label}
                </Link>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex h-9 w-full items-center justify-center rounded-lg border border-navbar-border text-sm font-medium text-navbar-foreground transition-colors hover:bg-navbar-hover"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={onClose}
                className="flex h-9 items-center justify-center rounded-lg border border-navbar-border text-sm font-medium text-navbar-foreground transition-colors hover:bg-navbar-hover"
              >
                Login
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="flex h-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-primary-hover"
              >
                Sign Up
              </Link>
              <Link
                href="/register?role=seller"
                onClick={onClose}
                className="flex h-9 items-center justify-center rounded-lg border border-navbar-border bg-navbar-active text-sm font-medium text-navbar-active-foreground transition-colors hover:bg-navbar-hover"
              >
                Become a Seller
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
