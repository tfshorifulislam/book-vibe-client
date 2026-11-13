import Link from "next/link";
import {
  ArrowRight,
  FileText,
  HelpCircle,
  Image as ImageIcon,
} from "lucide-react";

import { prisma } from "@/lib/db";

export default async function AdminContentHubPage() {
  const [bannersCount, faqsCount] = await Promise.all([
    prisma.banner.count(),
    prisma.faq.count(),
  ]);

  const cards = [
    {
      title: "Hero & Promo Banners",
      description:
        "Manage homepage sliders, seasonal discount banners, and callout promotions.",
      href: "/admin/banners",
      count: `${bannersCount} Banners`,
      icon: ImageIcon,
    },
    {
      title: "Frequently Asked Questions",
      description:
        "Add, reorder, or update questions and answers shown in the Help & FAQ center.",
      href: "/admin/faqs",
      count: `${faqsCount} FAQs`,
      icon: HelpCircle,
    },
    {
      title: "Static Policies & Pages",
      description:
        "Review public Terms, Privacy, Return, and Shipping policy pages.",
      href: "/about",
      count: "Storefront Pages",
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Content Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Oversee storefront content, marketing banners, and help center
          documentation.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group flex flex-col justify-between rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div>
                <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </div>
                <h2 className="text-base font-semibold text-foreground transition-colors group-hover:text-primary">
                  {card.title}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {card.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4 text-xs">
                <span className="font-medium text-foreground">
                  {card.count}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  Manage{" "}
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
