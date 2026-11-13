"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  Heart,
  Menu,
  MessageCircle,
  ShoppingCart,
} from "lucide-react";
import { useCartCount } from "@/lib/hooks/useCartCount";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/category";
import type { User } from "@/types";
import { CategoriesDropdown } from "./CategoriesDropdown";
import { MobileNavigation } from "./MobileNavigation";
import { NotificationMenu } from "./NotificationMenu";
import { ProfileMenu } from "./ProfileMenu";
import { ThemeToggle } from "./ThemeToggle";

const PRIMARY_LEFT = [
  { label: "Home", href: "/" },
  { label: "Browse Books", href: "/books" },
] as const;

const PRIMARY_RIGHT = [
  { label: "Top Sellers", href: "/sellers" },
  { label: "About Us", href: "/about" },
] as const;

const iconButtonClass =
  "relative inline-flex size-9 items-center justify-center rounded-full text-navbar-muted-foreground transition-colors hover:bg-navbar-hover hover:text-navbar-hover-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const actionButtonClass =
  "inline-flex h-9 items-center justify-center rounded-lg px-3.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string;
}) {
  const active = isNavActive(pathname, href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active
          ? "bg-navbar-nav-active font-semibold text-navbar-nav-active-foreground"
          : "text-navbar-nav-foreground hover:bg-navbar-nav-hover hover:text-navbar-nav-hover-foreground",
      )}
    >
      {label}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-navbar-nav-active-indicator transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </Link>
  );
}

function CartLink({ count }: { count: number }) {
  return (
    <Link href="/buyer/cart" aria-label="Cart" className={iconButtonClass}>
      <ShoppingCart className="size-5" aria-hidden="true" />
      {count > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4 font-bold text-primary-foreground">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}

interface RightSideProps {
  user: User | null;
  cartCount: number;
  onLogout: () => void;
}

function RightSide({ user, cartCount, onLogout }: RightSideProps) {
  if (!user) {
    return (
      <>
        <Link
          href="/register?role=seller"
          className={cn(
            actionButtonClass,
            "hidden border border-navbar-border text-navbar-foreground hover:border-primary/30 hover:bg-navbar-hover hover:text-navbar-hover-foreground lg:inline-flex",
          )}
        >
          Become a Seller
        </Link>
        <Link
          href="/login"
          className={cn(
            actionButtonClass,
            "text-navbar-foreground hover:bg-navbar-hover hover:text-navbar-hover-foreground",
          )}
        >
          Login
        </Link>
        <Link
          href="/register"
          className={cn(
            actionButtonClass,
            "bg-primary px-4 font-semibold text-primary-foreground hover:bg-brand-primary-hover",
          )}
        >
          Sign Up
        </Link>
      </>
    );
  }

  if (user.role === "buyer") {
    return (
      <>
        <Link
          href="/buyer/wishlist"
          aria-label="Wishlist"
          className={iconButtonClass}
        >
          <Heart className="size-5" aria-hidden="true" />
        </Link>
        <CartLink count={cartCount} />
        <Link
          href="/buyer/messages"
          aria-label="Messages"
          className={iconButtonClass}
        >
          <MessageCircle className="size-5" aria-hidden="true" />
        </Link>
        <NotificationMenu />
        <ProfileMenu user={user} onLogout={onLogout} />
      </>
    );
  }

  if (user.role === "seller") {
    return (
      <>
        <Link
          href="/seller/messages"
          aria-label="Messages"
          className={iconButtonClass}
        >
          <MessageCircle className="size-5" aria-hidden="true" />
        </Link>
        <NotificationMenu />
        <ProfileMenu user={user} onLogout={onLogout} />
      </>
    );
  }

  return <ProfileMenu user={user} onLogout={onLogout} />;
}

interface NavbarProps {
  categories?: Category[];
  user?: User | null;
}

export function Navbar({
  categories = [],
  user: initialUser = null,
}: NavbarProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const cartCount = useCartCount();

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 4);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  function handleLogout() {
    setUser(null);
    closeMobile();
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 border-b bg-navbar-background/85 backdrop-blur-md transition-[border-color,box-shadow] duration-200",
          scrolled
            ? "border-navbar-border-scrolled shadow-[var(--navbar-shadow)]"
            : "border-navbar-border-idle",
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 text-lg font-bold tracking-tight text-navbar-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="BookHand home"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-[image:var(--navbar-logo-background)] text-on-brand shadow-sm">
              <BookOpen className="size-4" aria-hidden="true" />
            </span>
            <span>BookHand</span>
          </Link>

          <nav
            aria-label="Primary navigation"
            className="hidden flex-1 items-center justify-center gap-1 lg:flex"
          >
            {PRIMARY_LEFT.map((item) => (
              <NavLink key={item.href} {...item} pathname={pathname} />
            ))}

            <CategoriesDropdown categories={categories} pathname={pathname} />

            {PRIMARY_RIGHT.map((item) => (
              <NavLink key={item.href} {...item} pathname={pathname} />
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden items-center gap-2 lg:flex">
              <RightSide
                user={user}
                cartCount={cartCount}
                onLogout={handleLogout}
              />
            </div>

            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileOpen((value) => !value)}
              className="inline-flex size-9 items-center justify-center rounded-full text-navbar-foreground transition-colors hover:bg-navbar-hover hover:text-navbar-hover-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none lg:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <MobileNavigation
        isOpen={mobileOpen}
        onClose={closeMobile}
        user={user}
        onLogout={handleLogout}
        categories={categories}
      />
    </>
  );
}
