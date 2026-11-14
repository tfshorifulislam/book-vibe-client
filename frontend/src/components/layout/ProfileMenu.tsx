"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { LogOut } from "lucide-react";
import { useDismiss } from "@/lib/hooks/useDismiss";
import { cn, getInitials } from "@/lib/utils";
import type { User } from "@/types";

interface ProfileMenuProps {
  user: User;
  onLogout: () => void;
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

export function ProfileMenu({ user, onLogout }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dashboard = getDashboard(user.role);

  useDismiss(containerRef, open, () => setOpen(false));

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        onClick={() => setOpen((value) => !value)}
        className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatar}
            alt=""
            className="size-9 object-cover"
            aria-hidden="true"
          />
        ) : (
          getInitials(user.name)
        )}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account menu"
          className={cn(
            "absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-navbar-dropdown-border bg-navbar-dropdown-background shadow-[var(--navbar-dropdown-shadow)]",
            "animate-in duration-150 fade-in-0 zoom-in-95 slide-in-from-top-1",
          )}
        >
          <div className="border-b border-navbar-dropdown-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-navbar-foreground">
              {user.name}
            </p>
            <p className="truncate text-xs text-navbar-muted-foreground">
              {user.email}
            </p>
          </div>

          <ul className="py-2">
            <li>
              <Link
                href={dashboard.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block px-4 py-2 text-sm text-navbar-foreground transition-colors hover:bg-navbar-hover hover:text-navbar-hover-foreground focus-visible:bg-navbar-hover focus-visible:outline-none"
              >
                {dashboard.label}
              </Link>
            </li>
          </ul>

          <div className="border-t border-navbar-dropdown-border py-2">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-navbar-foreground transition-colors hover:bg-navbar-hover hover:text-navbar-hover-foreground focus-visible:bg-navbar-hover focus-visible:outline-none"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
