"use client";

import { useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useDismiss } from "@/lib/hooks/useDismiss";
import { cn } from "@/lib/utils";

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useDismiss(containerRef, open, () => setOpen(false));

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex size-9 items-center justify-center rounded-full text-navbar-muted-foreground transition-colors hover:bg-navbar-hover hover:text-navbar-hover-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Bell className="size-5" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Notifications"
          className={cn(
            "absolute top-full right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-navbar-dropdown-border bg-navbar-dropdown-background shadow-[var(--navbar-dropdown-shadow)]",
            "animate-in duration-150 fade-in-0 zoom-in-95 slide-in-from-top-1",
          )}
        >
          <div className="border-b border-navbar-dropdown-border px-4 py-3">
            <p className="text-sm font-semibold text-navbar-foreground">
              Notifications
            </p>
          </div>
          <div className="flex flex-col items-center px-4 py-8 text-center">
            <span className="flex size-10 items-center justify-center rounded-full bg-navbar-hover text-navbar-muted-foreground">
              <Bell className="size-4" aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-medium text-navbar-foreground">
              No notifications yet
            </p>
            <p className="mt-1 text-xs text-navbar-muted-foreground">
              Order updates and messages will appear here.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
