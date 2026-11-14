import type { Metadata } from "next";

import { InfoPage, InfoSection } from "@/components/marketplace/info-page";

export const metadata: Metadata = { title: "Terms & conditions" };

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms & conditions"
      description="The rules for using BookHand as a buyer, seller, or visitor."
    >
      <InfoSection title="Using BookHand">
        <p>
          You must provide accurate account information and use the marketplace
          lawfully. You are responsible for activity under your account and for
          keeping your password secure.
        </p>
      </InfoSection>
      <InfoSection title="Listings and sales">
        <p>
          Sellers must describe books accurately, maintain sufficient stock, and
          fulfil confirmed orders. Prices, condition, and availability are the
          seller&apos;s responsibility. BookHand may remove listings that
          violate these terms.
        </p>
      </InfoSection>
      <InfoSection title="Payments and fees">
        <p>
          Buyers pay the order total shown at checkout. Seller commissions,
          where applicable, are shown in the seller dashboard. Payouts may be
          held while an order or dispute is under review.
        </p>
      </InfoSection>
      <InfoSection title="Prohibited conduct">
        <p>
          Do not list counterfeit, stolen, or prohibited material; manipulate
          reviews; harass other users; or attempt to bypass the
          marketplace&apos;s payment and safety systems.
        </p>
      </InfoSection>
      <InfoSection title="Changes">
        <p>
          We may update these terms as the marketplace evolves. Continued use
          after an update constitutes acceptance of the revised terms.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
