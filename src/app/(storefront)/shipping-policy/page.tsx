import type { Metadata } from "next";

import { InfoPage, InfoSection } from "@/components/marketplace/info-page";

export const metadata: Metadata = { title: "Shipping policy" };

export default function ShippingPolicyPage() {
  return (
    <InfoPage eyebrow="Policies" title="Shipping policy" description="How BookHand orders are packed, shipped, and tracked.">
      <InfoSection title="Delivery coverage">
        <p>BookHand sellers deliver across Bangladesh. Delivery availability and timelines are shown at checkout and confirmed by the seller after an order is placed.</p>
      </InfoSection>
      <InfoSection title="Shipping fees">
        <p>Standard delivery is ৳60. Orders over ৳800 qualify for free delivery. Any coupon that includes free shipping will remove the delivery fee at checkout.</p>
      </InfoSection>
      <InfoSection title="Processing and tracking">
        <p>Sellers confirm and pack orders after payment or COD confirmation. Once dispatched, the order page shows the carrier and tracking number when provided.</p>
      </InfoSection>
      <InfoSection title="Delays">
        <p>Weather, public holidays, and courier disruptions can affect delivery. If an order is significantly delayed, contact support with your order number.</p>
      </InfoSection>
    </InfoPage>
  );
}
