import type { Metadata } from "next";

import { InfoPage, InfoSection } from "@/components/marketplace/info-page";

export const metadata: Metadata = { title: "Cookie policy" };

export default function CookiePolicyPage() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Cookie policy"
      description="How BookHand uses cookies and local storage."
    >
      <InfoSection title="Essential cookies">
        <p>
          We use an HTTP-only session cookie to keep you signed in and to
          protect authenticated actions. These cookies cannot be disabled while
          using an account.
        </p>
      </InfoSection>
      <InfoSection title="Preferences">
        <p>
          Your theme choice may be stored locally in your browser so the site
          opens in the appearance you selected.
        </p>
      </InfoSection>
      <InfoSection title="Analytics and marketing">
        <p>
          BookHand does not currently load third-party advertising cookies. Any
          future analytics or marketing cookies will be disclosed and, where
          required, require consent.
        </p>
      </InfoSection>
      <InfoSection title="Managing cookies">
        <p>
          You can clear cookies and local storage through your browser settings.
          Clearing the session cookie will sign you out.
        </p>
      </InfoSection>
    </InfoPage>
  );
}
