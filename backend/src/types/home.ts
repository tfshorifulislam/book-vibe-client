export interface TrustItem {
  icon: string;
  label: string;
  description: string;
}

export interface HeroContent {
  eyebrow: string;
  heading: string;
  headingAccent: string;
  description: string;
  trustItems: TrustItem[];
}

export interface JourneyStep {
  step: string;
  title: string;
  description: string;
  icon: string;
}

export interface Journey {
  id: "buyer" | "seller";
  label: string;
  steps: JourneyStep[];
  cta: {
    label: string;
    href: string;
  };
}

export interface HowItWorksContent {
  title: string;
  description: string;
  journeys: Journey[];
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
  order: number;
  visible: boolean;
}

export interface FinalCtaContent {
  heading: string;
  description: string;
  primaryCta: {
    label: string;
    href: string;
  };
  secondaryCta: {
    label: string;
    href: string;
  };
}
