export type UserRole = "buyer" | "seller" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export type { Book, BookCondition, ListingType } from "./book";
export type { Category } from "./category";
export type { Offer } from "./offer";
export type { Seller, TopSeller } from "./seller";
export type { Testimonial } from "./testimonial";
export type {
  Feature,
  FinalCtaContent,
  HeroContent,
  HowItWorksContent,
  Journey,
  JourneyStep,
  TrustItem,
} from "./home";
