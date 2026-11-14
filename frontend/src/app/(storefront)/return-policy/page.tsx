import type { Metadata } from "next";

import { InfoPage, InfoSection } from "@/components/marketplace/info-page";

export const metadata: Metadata = { title: "Return policy" };

export default function ReturnPolicyPage() {
  return (
    <InfoPage
      eyebrow="Policies"
      title="Return policy"
      description="What to do if a book is not as described."
    >
      <InfoSection title="Return window">
        <p>
          You may request a return within 7 days of delivery if the book is
          materially different from its listing, arrives damaged, or is the
          wrong title.
        </p>
      </InfoSection>
      <InfoSection title="Condition requirements">
        <p>
          Returned books should be in the condition they were received. Include
          all original inserts, dust jackets, and accessories where applicable.
        </p>
      </InfoSection>
      <InfoSection title="How to request a return">
        <p>
          Open the order in your buyer dashboard and submit a refund request
          with photos and a description of the issue. The seller or a BookHand
          administrator will review it.
        </p>
      </InfoSection>
      <InfoSection title="Non-returnable cases">
        <p>
          Change-of-mind returns, digital products, and books damaged after
          delivery may not qualify. Used-book wear that was accurately described
          in the listing is not a defect.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
