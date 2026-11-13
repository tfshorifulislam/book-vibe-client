import type { Metadata } from "next";

import { InfoPage, InfoSection } from "@/components/marketplace/info-page";

export const metadata: Metadata = { title: "Refund policy" };

export default function RefundPolicyPage() {
  return (
    <InfoPage eyebrow="Policies" title="Refund policy" description="How refunds are reviewed and returned.">
      <InfoSection title="Approved refunds">
        <p>Once a refund is approved, the amount is returned using the original payment method where possible. Cash-on-delivery orders may be refunded via bKash or bank transfer.</p>
      </InfoSection>
      <InfoSection title="Timing">
        <p>Refund reviews normally take 2–5 business days after all requested evidence is submitted. Bank processing can add additional time.</p>
      </InfoSection>
      <InfoSection title="Partial refunds">
        <p>Where only part of an order is affected, the seller and buyer may agree to a partial refund. Shipping fees are refunded only when the issue is the seller&apos;s responsibility.</p>
      </InfoSection>
      <InfoSection title="Disputes">
        <p>If you cannot resolve a refund with the seller, open a dispute from the order page. A BookHand administrator will review the conversation and evidence.</p>
      </InfoSection>
    </InfoPage>
  );
}
