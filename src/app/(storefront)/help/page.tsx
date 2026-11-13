import type { Metadata } from "next";
import Link from "next/link";

import { InfoPage, InfoSection } from "@/components/marketplace/info-page";

export const metadata: Metadata = { title: "Help centre" };

export default function HelpPage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="How can we help?"
      description="Start with the topic closest to your question. If you still need help, contact our support team."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["Orders & delivery", "/buyer/orders", "Track an order, update delivery details, or report a problem."],
          ["Returns & refunds", "/return-policy", "Read the return window and how to request a refund."],
          ["Buying books", "/books", "Search, filter, and compare listings from trusted sellers."],
          ["Selling books", "/seller/dashboard", "Manage your shop, listings, stock, and orders."],
          ["Payments", "/refund-policy", "Learn about cash on delivery, bKash, Nagad, and card payments."],
          ["Account & security", "/login", "Sign in, reset your password, and manage your profile."],
        ].map(([title, href, description]) => (
          <Link key={title} href={href} className="rounded-xl border border-border bg-card p-5 hover:border-primary/40">
            <h2 className="font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>
      <InfoSection title="Still stuck?">
        <p>
          Email <a href="mailto:support@bookhand.com" className="font-medium text-primary hover:underline">support@bookhand.com</a> or use the <Link href="/contact" className="font-medium text-primary hover:underline">contact form</Link>. Include your order number if your question is about a purchase.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
