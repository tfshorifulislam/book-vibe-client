import type { Metadata } from "next";

import { InfoPage, InfoSection } from "@/components/marketplace/info-page";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPolicyPage() {
  return (
    <InfoPage eyebrow="Legal" title="Privacy policy" description="What information BookHand collects and how it is used.">
      <InfoSection title="Information we collect">
        <p>We collect account details, contact information, delivery addresses, order history, reviews, questions, and messages needed to operate the marketplace.</p>
      </InfoSection>
      <InfoSection title="How we use it">
        <p>Information is used to fulfil orders, provide support, prevent fraud, personalise recommendations, and send transactional or marketing communications you have requested.</p>
      </InfoSection>
      <InfoSection title="Sharing">
        <p>Sellers receive the delivery details needed to fulfil an order. Payment and delivery partners receive only the information required for their service. We do not sell personal data.</p>
      </InfoSection>
      <InfoSection title="Your choices">
        <p>You can update your profile and addresses in your account, unsubscribe from marketing email, and contact support to request account deletion subject to legal retention requirements.</p>
      </InfoSection>
    </InfoPage>
  );
}
