import type { Metadata } from "next";
import Link from "next/link";

import { InfoPage, InfoSection } from "@/components/marketplace/info-page";

export const metadata: Metadata = { title: "About BookHand" };

export default function AboutPage() {
  return (
    <InfoPage
      eyebrow="Our story"
      title="Books deserve a second life"
      description="BookHand is a Bangladesh-first marketplace for new and used books, connecting readers with trusted local sellers."
    >
      <InfoSection title="Why we built BookHand">
        <p>
          Great books are often sitting on shelves long after they have been
          read. At the same time, readers are looking for affordable copies of
          the books they need. BookHand makes that exchange simple, transparent,
          and safe.
        </p>
        <p>
          Buyers can compare condition, price, seller ratings, and delivery
          options. Sellers can open a shop, manage inventory, and reach readers
          across the country. Admins keep the marketplace fair and trustworthy.
        </p>
      </InfoSection>
      <InfoSection title="What we care about">
        <ul className="list-disc space-y-2 pl-5">
          <li>Accurate listings, especially for used books.</li>
          <li>Secure, transparent checkout and order tracking.</li>
          <li>Fair treatment of buyers and sellers.</li>
          <li>A local-first experience built for Bangladesh.</li>
        </ul>
      </InfoSection>
      <InfoSection title="Get involved">
        <p>
          Have books to sell?{" "}
          <Link
            href="/register?role=seller"
            className="font-medium text-primary hover:underline"
          >
            Open a shop
          </Link>
          . Looking for your next read?{" "}
          <Link
            href="/books"
            className="font-medium text-primary hover:underline"
          >
            Browse the catalogue
          </Link>
          . Questions?{" "}
          <Link
            href="/contact"
            className="font-medium text-primary hover:underline"
          >
            Contact our team
          </Link>
          .
        </p>
      </InfoSection>
    </InfoPage>
  );
}
