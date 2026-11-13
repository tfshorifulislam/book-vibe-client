import type { Metadata } from "next";

import { ContactForm } from "@/components/marketplace/contact-form";
import { InfoPage } from "@/components/marketplace/info-page";

export const metadata: Metadata = { title: "Contact BookHand" };

export default function ContactPage() {
  return (
    <InfoPage
      eyebrow="Support"
      title="Contact us"
      description="Send us a message and our support team will reply within one business day."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <ContactForm />
        <div className="space-y-4 rounded-xl border border-border bg-card p-5 text-sm">
          <div>
            <p className="font-semibold text-foreground">Email</p>
            <p>support@bookhand.com</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Phone</p>
            <p>+880 1700 000000</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Hours</p>
            <p>Saturday–Thursday, 10:00–18:00</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Location</p>
            <p>Dhaka, Bangladesh</p>
          </div>
        </div>
      </div>
    </InfoPage>
  );
}
