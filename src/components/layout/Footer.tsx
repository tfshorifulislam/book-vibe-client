import Link from "next/link";
import { Fragment } from "react";
import { Globe, Mail, MessageCircle, Rss } from "lucide-react";
import { FOOTER_LINKS, SITE_CONFIG, SOCIAL_LINKS } from "@/lib/constants";

const socialIcons = {
  globe: Globe,
  mail: Mail,
  chat: MessageCircle,
  rss: Rss,
} as const;

const footerColumns = [
  FOOTER_LINKS.quickLinks,
  FOOTER_LINKS.buyers,
  FOOTER_LINKS.sellers,
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold tracking-tight"
              aria-label="BookHand home"
            >
              <span aria-hidden="true">📚</span>
              <span>BookHand</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-background/70">
              {SITE_CONFIG.description}
            </p>
            <div className="mt-6 flex items-center gap-2">
              {SOCIAL_LINKS.map((social) => {
                const Icon = socialIcons[social.icon];
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-background/20 text-background/70 transition-colors hover:border-brand-accent hover:text-brand-accent focus-visible:ring-2 focus-visible:ring-background focus-visible:outline-none"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-semibold tracking-wide text-background">
                {column.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-background/70 transition-colors hover:text-background"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border/20 pt-6 text-sm text-background/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 BookHand. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-2">
            {FOOTER_LINKS.legal.links.map((link, index) => (
              <Fragment key={link.href}>
                {index > 0 ? (
                  <span aria-hidden="true" className="text-background/30">
                    |
                  </span>
                ) : null}
                <Link
                  href={link.href}
                  className="transition-colors hover:text-background"
                >
                  {link.label}
                </Link>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
