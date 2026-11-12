import type { FooterSection, NavItem } from "@/types";

export const SITE_CONFIG = {
  name: "BookHand",
  description:
    "BookHand is a trusted online marketplace to buy and sell new and used books.",
  url: "https://bookhand.com",
} as const;

export const NAV_LINKS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Browse", href: "/browse" },
  { label: "Categories", href: "/categories" },
];

export const FOOTER_LINKS = {
  quickLinks: {
    title: "Quick Links",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Blog", href: "/blog" },
    ],
  },
  buyers: {
    title: "For Buyers",
    links: [
      { label: "Browse", href: "/browse" },
      { label: "Categories", href: "/categories" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "Help", href: "/help" },
    ],
  },
  sellers: {
    title: "For Sellers",
    links: [
      { label: "Become a Seller", href: "/sell" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Guidelines", href: "/guidelines" },
      { label: "Support", href: "/support" },
    ],
  },
  legal: {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Refund", href: "/refund" },
    ],
  },
} satisfies Record<string, FooterSection>;

export const SOCIAL_LINKS = [
  { label: "Website", href: "https://bookhand.com", icon: "globe" },
  { label: "Email", href: "mailto:hello@bookhand.com", icon: "mail" },
  { label: "Community", href: "https://bookhand.com/community", icon: "chat" },
  { label: "Blog RSS", href: "https://bookhand.com/blog/rss.xml", icon: "rss" },
] as const;
