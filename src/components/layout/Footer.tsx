import Link from "next/link";
import { BookOpen, CreditCard } from "lucide-react";
import { Icon } from "@/components/shared/Icon";
import {
  FOOTER_NAV,
  PAYMENT_METHODS,
  SITE_CONFIG,
  SOCIAL_LINKS,
} from "@/lib/constants";
import { getCurrentYear } from "@/lib/services/site";
import { BackToTop } from "./BackToTop";

const socialIcons = {
  globe: "Globe",
  mail: "Mail",
  message: "MessageCircle",
  rss: "Rss",
} as const;

export async function Footer() {
  const year = await getCurrentYear();

  return (
    <footer className="border-t border-footer-border bg-footer text-footer-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-lg font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-footer-foreground"
              aria-label="BookHand home"
            >
              <span className="flex size-8 items-center justify-center rounded-lg brand-gradient text-on-brand">
                <BookOpen className="size-4" aria-hidden="true" />
              </span>
              <span>{SITE_CONFIG.name}</span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-footer-muted">
              {SITE_CONFIG.description}
            </p>

            <div className="mt-6 flex items-center gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="inline-flex size-9 items-center justify-center rounded-full border border-footer-border text-footer-muted transition-colors hover:border-footer-foreground hover:text-footer-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-footer-foreground"
                >
                  <Icon
                    name={socialIcons[social.icon]}
                    className="size-4"
                  />
                </a>
              ))}
            </div>
          </div>

          {FOOTER_NAV.map((section) => (
            <div key={section.title}>
              <h2 className="text-sm font-semibold tracking-wide text-footer-foreground">
                {section.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-footer-muted transition-colors hover:text-footer-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-footer-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-footer-border pt-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <p className="text-sm text-footer-muted">
                © {year} {SITE_CONFIG.name}. All rights reserved.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs text-footer-muted">
                  <CreditCard className="size-3.5" aria-hidden="true" />
                  We accept
                </span>
                {PAYMENT_METHODS.map((method) => (
                  <span
                    key={method}
                    className="rounded border border-footer-border px-2 py-0.5 text-[10px] font-medium text-footer-foreground"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="inline-flex size-8 items-center justify-center rounded-full text-footer-muted transition-colors hover:text-footer-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-footer-foreground"
                  >
                    <Icon
                      name={socialIcons[social.icon]}
                      className="size-3.5"
                    />
                  </a>
                ))}
              </div>
              <BackToTop />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
