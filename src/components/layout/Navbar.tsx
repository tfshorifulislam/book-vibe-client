"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { User } from "@/types";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  user?: User | null;
  cartCount?: number;
  wishlistCount?: number;
}

interface SearchFormProps {
  className?: string;
  onSearch?: () => void;
}

function SearchForm({ className, onSearch }: SearchFormProps) {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = String(data.get("q") ?? "").trim();
    onSearch?.();
    router.push(query ? `/browse?q=${encodeURIComponent(query)}` : "/browse");
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn("relative w-full", className)}
    >
      <Search
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        type="search"
        name="q"
        aria-label="Search books"
        placeholder="Search by title, author, or ISBN..."
        className="h-10 w-full rounded-lg border border-border bg-muted pr-4 pl-10 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
      />
    </form>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const iconButtonClass =
  "relative inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

export function Navbar({
  user: initialUser = null,
  cartCount = 0,
  wishlistCount = 0,
}: NavbarProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!mobileOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  function handleLogout() {
    setUser(null);
    closeMobileMenu();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-6 lg:px-8">
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-foreground"
          aria-label="BookHand home"
        >
          <span aria-hidden="true">📚</span>
          <span>BookHand</span>
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <SearchForm className="max-w-xl" />
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <ThemeToggle />

          {user ? (
            <>
              <Link
                href="/wishlist"
                aria-label={`Wishlist, ${wishlistCount} items`}
                className={cn(iconButtonClass, "hidden sm:inline-flex")}
              >
                <Heart className="size-5" aria-hidden="true" />
                {wishlistCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-secondary text-[10px] font-semibold text-secondary-foreground">
                    {wishlistCount}
                  </span>
                ) : null}
              </Link>

              <Link
                href="/cart"
                aria-label={`Cart, ${cartCount} items`}
                className={cn(iconButtonClass, "hidden sm:inline-flex")}
              >
                <ShoppingCart className="size-5" aria-hidden="true" />
                {cartCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-semibold text-secondary-foreground">
                    {cartCount}
                  </span>
                ) : null}
              </Link>
            </>
          ) : null}

          {user ? (
            <details className="group relative hidden md:block">
              <summary
                aria-label="Open account menu"
                className="flex cursor-pointer list-none items-center gap-1.5 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none [&::-webkit-details-marker]:hidden"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {getInitials(user.name)}
                </span>
                <ChevronDown
                  className="size-4 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>

              <div className="absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-card p-1 text-card-foreground shadow-lg">
                <div className="border-b border-border px-3 py-2">
                  <p className="truncate text-sm font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <div className="py-1">
                  <Link
                    href="/account"
                    className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    Account
                  </Link>
                  <Link
                    href="/orders"
                    className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    Orders
                  </Link>
                  {user.role !== "buyer" ? (
                    <Link
                      href="/dashboard"
                      className="block rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      Seller Dashboard
                    </Link>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md border-t border-border px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-muted"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Log out
                </button>
              </div>
            </details>
          ) : (
            <div className="hidden items-center gap-1.5 md:flex">
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
              >
                Sign Up
              </Link>
            </div>
          )}

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen(true)}
            className={cn(iconButtonClass, "lg:hidden")}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <button
          type="button"
          aria-label="Close menu"
          tabIndex={mobileOpen ? 0 : -1}
          onClick={closeMobileMenu}
          className={cn(
            "absolute inset-0 bg-foreground/40 backdrop-blur-sm transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
        />

        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          aria-hidden={!mobileOpen}
          inert={!mobileOpen}
          className={cn(
            "absolute top-0 right-0 flex h-full w-80 max-w-[85%] flex-col gap-6 border-l border-border bg-background p-5 shadow-xl transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-2 text-lg font-bold text-foreground"
            >
              <span aria-hidden="true">📚</span>
              <span>BookHand</span>
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={closeMobileMenu}
              className={iconButtonClass}
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <SearchForm onSearch={closeMobileMenu} />

          <nav aria-label="Mobile primary" className="flex flex-col gap-1">
            {NAV_LINKS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border pt-4">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {getInitials(user.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {user.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Link
                  href="/account"
                  onClick={closeMobileMenu}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Account
                </Link>
                <Link
                  href="/cart"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="size-4" aria-hidden="true" />
                    Cart
                  </span>
                  {cartCount > 0 ? (
                    <span className="flex min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-[10px] font-semibold text-secondary-foreground">
                      {cartCount}
                    </span>
                  ) : null}
                </Link>
                <Link
                  href="/wishlist"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="size-4" aria-hidden="true" />
                    Wishlist
                  </span>
                  {wishlistCount > 0 ? (
                    <span className="flex min-w-5 items-center justify-center rounded-full bg-secondary px-1.5 text-[10px] font-semibold text-secondary-foreground">
                      {wishlistCount}
                    </span>
                  ) : null}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-muted"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={closeMobileMenu}
                  className="rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
