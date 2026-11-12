import type {
  Feature,
  FinalCtaContent,
  HeroContent,
  HowItWorksContent,
} from "@/types/home";

export const HOME_CONTENT: {
  hero: HeroContent;
  howItWorks: HowItWorksContent;
  features: Feature[];
  finalCta: FinalCtaContent;
} = {
  hero: {
    eyebrow: "Your next favorite book is waiting",
    heading: "Discover Books.",
    headingAccent: "Share Knowledge.",
    description:
      "Explore thousands of titles from independent bookstores and readers. Find new favorites, revisit classics, and pass your well-loved books on to the next reader.",
    trustItems: [
      {
        icon: "BookOpen",
        label: "Curated Collection",
        description: "New and pre-loved titles",
      },
      {
        icon: "Store",
        label: "Independent Sellers",
        description: "Bookshops from across the country",
      },
      {
        icon: "MessageCircle",
        label: "Direct Communication",
        description: "Talk to sellers before you buy",
      },
    ],
  },
  howItWorks: {
    title: "How BookHand Works",
    description:
      "A simple path for readers to find their next book and for sellers to reach more readers.",
    journeys: [
      {
        id: "buyer",
        label: "Buyer Journey",
        steps: [
          {
            step: "01",
            title: "Discover Books",
            description:
              "Explore thousands of books. Find titles by category, author, ISBN, or publisher.",
            icon: "Search",
          },
          {
            step: "02",
            title: "Place Your Order",
            description:
              "Select the books you love, add them to your cart, and complete checkout.",
            icon: "ShoppingCart",
          },
          {
            step: "03",
            title: "Receive Your Books",
            description:
              "Track your order, receive your books, and share a review with other readers.",
            icon: "Package",
          },
        ],
        cta: {
          label: "Start Exploring",
          href: "/books",
        },
      },
      {
        id: "seller",
        label: "Seller Journey",
        steps: [
          {
            step: "01",
            title: "Create Your Shop",
            description:
              "Register as a seller and set up your bookstore profile in a few minutes.",
            icon: "Store",
          },
          {
            step: "02",
            title: "List Your Books",
            description:
              "Upload book information, set your prices, and manage your available stock.",
            icon: "BookOpen",
          },
          {
            step: "03",
            title: "Start Selling",
            description:
              "Receive orders, manage sales, and keep track of your earnings from one dashboard.",
            icon: "TrendingUp",
          },
        ],
        cta: {
          label: "Start Selling",
          href: "/register?role=seller",
        },
      },
    ],
  },
  features: [
    {
      icon: "Library",
      title: "Wide Book Collection",
      description:
        "Browse fiction, academic titles, children's books, biographies, and more in one place.",
      order: 1,
      visible: true,
    },
    {
      icon: "Store",
      title: "Independent Book Sellers",
      description:
        "Discover bookshops and individual sellers, each with their own curated catalogue.",
      order: 2,
      visible: true,
    },
    {
      icon: "Search",
      title: "Easy Book Discovery",
      description:
        "Search by title, author, ISBN, or publisher and narrow down by category and condition.",
      order: 3,
      visible: true,
    },
    {
      icon: "CreditCard",
      title: "Multiple Payment Options",
      description:
        "Choose from the payment methods available at checkout for your convenience.",
      order: 4,
      visible: true,
    },
    {
      icon: "MessageCircle",
      title: "Buyer-Seller Communication",
      description:
        "Ask questions about a book's condition, edition, or availability before you order.",
      order: 5,
      visible: true,
    },
    {
      icon: "Package",
      title: "Simple Order Tracking",
      description:
        "Follow your order from confirmation to delivery from your buyer dashboard.",
      order: 6,
      visible: true,
    },
  ],
  finalCta: {
    heading: "Your Next Chapter Starts Here.",
    description:
      "Whether you are looking for a new read or ready to clear your shelf, BookHand brings readers and sellers together.",
    primaryCta: {
      label: "Explore Books",
      href: "/books",
    },
    secondaryCta: {
      label: "Become a Seller",
      href: "/register?role=seller",
    },
  },
};
