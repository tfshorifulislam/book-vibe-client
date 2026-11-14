import type { FooterSection, NavItem } from "@/types";

export const SITE_CONFIG = {
  name: "BookHand",
  description:
    "BookHand is a trusted online marketplace to buy and sell new and used books.",
  url: "https://bookhand.com",
  tagline: "Discover Books. Share Knowledge.",
} as const;

export const NAV_LINKS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Browse Books", href: "/books" },
  { label: "Categories", href: "/categories" },
  { label: "Top Sellers", href: "/sellers" },
  { label: "About Us", href: "/about" },
];

export const FOOTER_NAV: FooterSection[] = [
  {
    title: "Explore",
    links: [
      { label: "Browse Books", href: "/books" },
      { label: "Categories", href: "/categories" },
      { label: "New Arrivals", href: "/books?sort=newest" },
      { label: "Best Sellers", href: "/books?sort=popular" },
      { label: "Top Sellers", href: "/sellers" },
    ],
  },
  {
    title: "For Users",
    links: [
      { label: "My Account", href: "/buyer/dashboard" },
      { label: "Wishlist", href: "/buyer/wishlist" },
      { label: "My Orders", href: "/buyer/orders" },
      { label: "Become a Seller", href: "/register?role=seller" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Refund Policy", href: "/refund-policy" },
    ],
  },
];

export const SOCIAL_LINKS = [
  { label: "Website", href: "https://bookhand.com", icon: "globe" },
  { label: "Email", href: "mailto:hello@bookhand.com", icon: "mail" },
  {
    label: "Community",
    href: "https://bookhand.com/community",
    icon: "message",
  },
  { label: "Blog RSS", href: "https://bookhand.com/blog/rss.xml", icon: "rss" },
] as const;

export const PAYMENT_METHODS = [
  "Visa",
  "Mastercard",
  "bKash",
  "Nagad",
  "Cash on Delivery",
] as const;

export const CURRENCY = {
  code: "BDT",
  symbol: "৳",
  locale: "en-BD",
} as const;

export const SEARCH_HELP_TEXT =
  "Search by book title, author, ISBN, or publisher.";
