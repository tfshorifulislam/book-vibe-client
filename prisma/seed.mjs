import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

const categories = [
  {
    id: "cat-fiction",
    name: "Fiction",
    slug: "fiction",
    description: "Novels, short stories, and imaginative literature.",
    icon: "BookOpen",
    order: 1,
  },
  {
    id: "cat-academic",
    name: "Academic",
    slug: "academic",
    description: "Textbooks, reference books, and study guides.",
    icon: "GraduationCap",
    order: 2,
  },
  {
    id: "cat-islamic",
    name: "Islamic",
    slug: "islamic",
    description: "Islamic studies, Quran, Hadith, and spiritual books.",
    icon: "Moon",
    order: 3,
  },
  {
    id: "cat-children",
    name: "Children",
    slug: "children",
    description: "Picture books, early readers, and young adult fiction.",
    icon: "Baby",
    order: 4,
  },
  {
    id: "cat-science",
    name: "Science & Technology",
    slug: "science-and-technology",
    description: "Science, engineering, programming, and technology.",
    icon: "Cpu",
    order: 5,
  },
  {
    id: "cat-business",
    name: "Business",
    slug: "business",
    description: "Entrepreneurship, management, finance, and marketing.",
    icon: "Briefcase",
    order: 6,
  },
  {
    id: "cat-history",
    name: "History",
    slug: "history",
    description: "World history, biographies, and historical events.",
    icon: "Landmark",
    order: 7,
  },
  {
    id: "cat-biography",
    name: "Biography",
    slug: "biography",
    description: "Life stories of inspiring people and leaders.",
    icon: "User",
    order: 8,
  },
  {
    id: "cat-classics",
    name: "Classics",
    slug: "fiction/classics",
    description: "Timeless classic literature.",
    icon: "BookOpen",
    order: 1,
    parentId: "cat-fiction",
  },
  {
    id: "cat-mystery",
    name: "Mystery & Thriller",
    slug: "fiction/mystery",
    description: "Mystery, crime, and thriller books.",
    icon: "Search",
    order: 2,
    parentId: "cat-fiction",
  },
  {
    id: "cat-fantasy",
    name: "Fantasy",
    slug: "fiction/fantasy",
    description: "Fantasy and speculative fiction.",
    icon: "Sparkles",
    order: 3,
    parentId: "cat-fiction",
  },
  {
    id: "cat-engineering",
    name: "Engineering",
    slug: "academic/engineering",
    description: "Engineering textbooks and references.",
    icon: "Wrench",
    order: 1,
    parentId: "cat-academic",
  },
  {
    id: "cat-exam",
    name: "Exam Preparation",
    slug: "academic/exam-preparation",
    description: "Exam guides and preparation material.",
    icon: "ClipboardCheck",
    order: 2,
    parentId: "cat-academic",
  },
];

const shops = [
  {
    id: "shop-booknest",
    ownerId: "user-seller-1",
    name: "BookNest BD",
    slug: "booknest-bd",
    city: "Dhaka",
    district: "Dhaka",
    description: "Curated new and used books delivered across Bangladesh.",
    rating: 4.9,
  },
  {
    id: "shop-readmore",
    ownerId: "user-seller-2",
    name: "ReadMore Shop",
    slug: "readmore-shop",
    city: "Chattogram",
    district: "Chattogram",
    description: "Business, self-development, and academic titles.",
    rating: 4.8,
  },
  {
    id: "shop-papertrail",
    ownerId: "user-seller-3",
    name: "PaperTrail",
    slug: "papertrail",
    city: "Sylhet",
    district: "Sylhet",
    description: "Rare finds, classics, and used textbooks.",
    rating: 4.7,
  },
  {
    id: "shop-mindspace",
    ownerId: "user-seller-4",
    name: "MindSpace Books",
    slug: "mindspace-books",
    city: "Rajshahi",
    district: "Rajshahi",
    description: "Mindfulness, science, and technology books.",
    rating: 4.6,
  },
  {
    id: "shop-chapterone",
    ownerId: "user-seller-5",
    name: "Chapter One",
    slug: "chapter-one",
    city: "Khulna",
    district: "Khulna",
    description: "Fiction and biography specialists.",
    rating: 4.5,
  },
  {
    id: "shop-readingroom",
    ownerId: "user-seller-6",
    name: "The Reading Room",
    slug: "the-reading-room",
    city: "Barishal",
    district: "Barishal",
    description: "A friendly neighbourhood bookshop.",
    rating: 4.4,
  },
];

const rawBooks = [
  [
    "book-1",
    "the-alchemist-paulo-coelho",
    "The Alchemist",
    "Paulo Coelho",
    "fiction",
    "HarperOne",
    "978-0062315007",
    320,
    450,
    "LIKE_NEW",
    "NEW",
    5,
    "booknest-bd",
    true,
    false,
    false,
    1240,
    4.8,
    0,
    "2026-10-18",
  ],
  [
    "book-2",
    "atomic-habits-james-clear",
    "Atomic Habits",
    "James Clear",
    "business",
    "Avery",
    "978-0735211292",
    480,
    600,
    "NEW",
    "NEW",
    12,
    "readmore-shop",
    true,
    false,
    true,
    3410,
    4.9,
    4820,
    "2026-09-30",
  ],
  [
    "book-3",
    "sapiens-yuval-noah-harari",
    "Sapiens: A Brief History of Humankind",
    "Yuval Noah Harari",
    "history",
    "Harper",
    "978-0062316097",
    550,
    700,
    "GOOD",
    "NEW",
    3,
    "papertrail",
    true,
    false,
    false,
    2100,
    4.7,
    3120,
    "2026-09-12",
  ],
  [
    "book-4",
    "rich-dad-poor-dad-robert-kiyosaki",
    "Rich Dad Poor Dad",
    "Robert T. Kiyosaki",
    "business",
    "Plata Publishing",
    "978-1612680194",
    290,
    400,
    "ACCEPTABLE",
    "NEW",
    7,
    "booknest-bd",
    true,
    false,
    false,
    870,
    4.6,
    2450,
    "2026-08-24",
  ],
  [
    "book-5",
    "thinking-fast-and-slow-kahneman",
    "Thinking, Fast and Slow",
    "Daniel Kahneman",
    "science-and-technology",
    "Farrar, Straus and Giroux",
    "978-0374533557",
    420,
    null,
    "LIKE_NEW",
    "NEW",
    2,
    "mindspace-books",
    true,
    false,
    false,
    540,
    4.5,
    1680,
    "2026-08-02",
  ],
  [
    "book-6",
    "zero-to-one-peter-thiel",
    "Zero to One",
    "Peter Thiel",
    "business",
    "Crown Business",
    "978-0804139298",
    360,
    480,
    "GOOD",
    "NEW",
    9,
    "readmore-shop",
    true,
    false,
    false,
    320,
    4.4,
    1320,
    "2026-07-19",
  ],
  [
    "book-19",
    "the-midnight-library-matt-haig",
    "The Midnight Library",
    "Matt Haig",
    "fiction",
    "Canongate Books",
    "978-1786892737",
    390,
    520,
    "NEW",
    "NEW",
    6,
    "chapter-one",
    true,
    false,
    false,
    980,
    4.6,
    2140,
    "2026-10-30",
  ],
  [
    "book-20",
    "educated-tara-westover",
    "Educated",
    "Tara Westover",
    "biography",
    "Random House",
    "978-0399590504",
    440,
    560,
    "LIKE_NEW",
    "NEW",
    4,
    "the-reading-room",
    true,
    false,
    false,
    1560,
    4.7,
    2680,
    "2026-10-25",
  ],
  [
    "book-7",
    "1984-george-orwell",
    "1984",
    "George Orwell",
    "fiction",
    "Secker & Warburg",
    "978-0451524935",
    260,
    350,
    "NEW",
    "NEW",
    20,
    "papertrail",
    false,
    false,
    true,
    5100,
    4.9,
    6210,
    "2026-06-11",
  ],
  [
    "book-8",
    "to-kill-a-mockingbird-harper-lee",
    "To Kill a Mockingbird",
    "Harper Lee",
    "fiction",
    "J. B. Lippincott & Co.",
    "978-0061120084",
    300,
    null,
    "LIKE_NEW",
    "NEW",
    8,
    "booknest-bd",
    false,
    false,
    true,
    4320,
    4.8,
    5480,
    "2026-05-28",
  ],
  [
    "book-9",
    "the-power-of-now-eckhart-tolle",
    "The Power of Now",
    "Eckhart Tolle",
    "islamic",
    "New World Library",
    "978-1577314806",
    350,
    450,
    "GOOD",
    "NEW",
    6,
    "mindspace-books",
    false,
    false,
    true,
    1890,
    4.7,
    3910,
    "2026-05-02",
  ],
  [
    "book-10",
    "deep-work-cal-newport",
    "Deep Work",
    "Cal Newport",
    "business",
    "Grand Central Publishing",
    "978-1455586691",
    390,
    520,
    "NEW",
    "NEW",
    14,
    "readmore-shop",
    false,
    false,
    true,
    760,
    4.6,
    2870,
    "2026-04-16",
  ],
  [
    "book-11",
    "fourth-wing-rebecca-yarros",
    "Fourth Wing",
    "Rebecca Yarros",
    "fiction",
    "Red Tower Books",
    "978-1649374042",
    580,
    null,
    "NEW",
    "NEW",
    10,
    "papertrail",
    false,
    true,
    false,
    230,
    4.5,
    0,
    "2026-11-12",
  ],
  [
    "book-12",
    "good-energy-casey-means",
    "Good Energy",
    "Casey Means",
    "science-and-technology",
    "Avery",
    "978-0593712641",
    490,
    620,
    "NEW",
    "NEW",
    7,
    "mindspace-books",
    false,
    true,
    false,
    110,
    4.3,
    0,
    "2026-11-10",
  ],
  [
    "book-13",
    "the-covenant-of-water-abraham-verghese",
    "The Covenant of Water",
    "Abraham Verghese",
    "fiction",
    "Grove Press",
    "978-0802162175",
    540,
    null,
    "NEW",
    "NEW",
    5,
    "booknest-bd",
    false,
    true,
    false,
    190,
    4.6,
    0,
    "2026-11-08",
  ],
  [
    "book-14",
    "outlive-peter-attia",
    "Outlive: The Science and Art of Longevity",
    "Peter Attia",
    "science-and-technology",
    "Harmony",
    "978-0593236598",
    610,
    750,
    "NEW",
    "NEW",
    11,
    "readmore-shop",
    false,
    true,
    false,
    340,
    4.8,
    0,
    "2026-11-05",
  ],
  [
    "book-15",
    "data-structures-algorithms-thomas-cormen",
    "Introduction to Algorithms",
    "Thomas H. Cormen",
    "academic/engineering",
    "MIT Press",
    "978-0262046305",
    450,
    1200,
    "ACCEPTABLE",
    "USED",
    2,
    "papertrail",
    false,
    false,
    false,
    892,
    4.7,
    0,
    "2026-11-01",
  ],
  [
    "book-16",
    "clean-code-robert-martin",
    "Clean Code",
    "Robert C. Martin",
    "academic/engineering",
    "Prentice Hall",
    "978-0132350884",
    380,
    850,
    "GOOD",
    "USED",
    3,
    "mindspace-books",
    false,
    false,
    false,
    1120,
    4.6,
    0,
    "2026-10-29",
  ],
  [
    "book-17",
    "the-pragmatic-programmer",
    "The Pragmatic Programmer",
    "David Thomas & Andrew Hunt",
    "science-and-technology",
    "Addison-Wesley",
    "978-0135957059",
    420,
    900,
    "POOR",
    "USED",
    1,
    "booknest-bd",
    false,
    false,
    false,
    760,
    4.8,
    0,
    "2026-10-24",
  ],
  [
    "book-18",
    "design-patterns-gang-of-four",
    "Design Patterns",
    "Gang of Four",
    "academic/engineering",
    "Addison-Wesley",
    "978-0201633610",
    500,
    1100,
    "LIKE_NEW",
    "USED",
    2,
    "readmore-shop",
    false,
    false,
    false,
    540,
    4.5,
    0,
    "2026-10-20",
  ],
];

const descriptions = {
  fiction:
    "A captivating work of fiction that draws readers into a richly imagined world with memorable characters and a story that lingers long after the final page.",
  business:
    "A practical and insightful book on business, habits, and personal growth, packed with actionable ideas you can apply right away.",
  history:
    "A sweeping exploration of history and human civilization, written with clarity and depth for curious readers.",
  biography:
    "An inspiring true story of resilience, learning, and self-discovery that has moved readers around the world.",
  "science-and-technology":
    "An accessible and thought-provoking look at science, health, and technology from a leading voice in the field.",
  islamic:
    "A thoughtful spiritual and self-development book that offers perspective, calm, and practical wisdom.",
  "academic/engineering":
    "An essential reference for students and professionals, covering core concepts with clear explanations and examples.",
};

async function main() {
  console.log("Clearing existing data...");
  await prisma.auditLog.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.payout.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.question.deleteMany();
  await prisma.review.deleteMany();
  await prisma.couponUsage.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.bookImage.deleteMany();
  await prisma.book.deleteMany();
  await prisma.publisher.deleteMany();
  await prisma.author.deleteMany();
  await prisma.category.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.siteSetting.deleteMany();
  await prisma.newsletterSubscription.deleteMany();

  console.log("Seeding users...");
  const sellerPassword = hashPassword("Seller@12345");
  const buyerPassword = hashPassword("Buyer@12345");
  await prisma.user.create({
    data: {
      id: "user-admin",
      name: "BookHand Admin",
      email: "admin@bookhand.com",
      passwordHash: hashPassword("Admin@12345"),
      role: "ADMIN",
      emailVerified: true,
      avatar: null,
      phone: "+8801700000000",
    },
  });
  await prisma.user.create({
    data: {
      id: "user-buyer",
      name: "Ayesha Rahman",
      email: "buyer@bookhand.com",
      passwordHash: buyerPassword,
      role: "BUYER",
      emailVerified: true,
      phone: "+8801712345678",
      avatar: null,
    },
  });
  for (let i = 0; i < shops.length; i++) {
    const shop = shops[i];
    await prisma.user.create({
      data: {
        id: shop.ownerId,
        name: shop.name,
        email: `seller${i + 1}@bookhand.com`,
        passwordHash: sellerPassword,
        role: "SELLER",
        emailVerified: true,
        phone: `+88018${String(10000000 + i).slice(0, 8)}`,
      },
    });
  }

  await prisma.address.create({
    data: {
      id: "addr-buyer-default",
      userId: "user-buyer",
      label: "Home",
      recipientName: "Ayesha Rahman",
      phone: "+8801712345678",
      district: "Dhaka",
      city: "Dhaka",
      area: "Dhanmondi",
      postalCode: "1209",
      instructions: "Please call before delivery.",
      isDefault: true,
    },
  });

  console.log("Seeding categories, shops, authors, publishers...");
  for (const category of categories) {
    await prisma.category.create({ data: category });
  }
  const shopsBySlug = {};
  for (const shop of shops) {
    const created = await prisma.shop.create({
      data: {
        id: shop.id,
        ownerId: shop.ownerId,
        name: shop.name,
        slug: shop.slug,
        description: shop.description,
        email: `hello@${shop.slug}.com`,
        phone: "+8801800000000",
        address: `${shop.city}, Bangladesh`,
        district: shop.district,
        city: shop.city,
        status: "ACTIVE",
      },
    });
    shopsBySlug[shop.slug] = created;
  }

  const authorNames = [...new Set(rawBooks.map((b) => b[3]))];
  const publisherNames = [...new Set(rawBooks.map((b) => b[5]))];
  const authors = {};
  for (const name of authorNames) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    authors[name] = await prisma.author.create({
      data: {
        name,
        slug,
        bio: `${name} is a widely read author featured on BookHand.`,
      },
    });
  }
  const publishers = {};
  for (const name of publisherNames) {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    publishers[name] = await prisma.publisher.create({
      data: {
        name,
        slug,
        description: `${name} publishes books available through BookHand sellers.`,
      },
    });
  }

  console.log("Seeding books...");
  const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));
  for (const b of rawBooks) {
    const [
      id,
      slug,
      title,
      author,
      categorySlug,
      publisher,
      isbn,
      price,
      originalPrice,
      condition,
      listingType,
      stock,
      shopSlug,
      isFeatured,
      isNewArrival,
      isBestSeller,
      reviewCount,
      rating,
      salesCount,
      listedAt,
    ] = b;
    const shop = shopsBySlug[shopSlug];
    const category = categoryBySlug[categorySlug];
    const ratingSum = Math.round(reviewCount * rating);
    await prisma.book.create({
      data: {
        id,
        slug,
        title,
        description:
          descriptions[categorySlug] ||
          descriptions[Object.keys(descriptions)[0]],
        isbn,
        language: "English",
        edition: "1st Edition",
        pageCount: 180 + (Number(id.replace(/\D/g, "")) || 0) * 13,
        coverTone: ((Number(id.replace(/\D/g, "")) || 1) % 6) + 1,
        condition,
        listingType,
        price,
        originalPrice,
        stock,
        ratingSum,
        ratingCount: reviewCount,
        salesCount,
        isFeatured,
        isNewArrival,
        isBestSeller,
        isActive: true,
        shopId: shop.id,
        categoryId: category.id,
        authorId: authors[author].id,
        publisherId: publishers[publisher]?.id,
        listedAt: new Date(`${listedAt}T08:00:00Z`),
        createdAt: new Date(`${listedAt}T08:00:00Z`),
      },
    });
    await prisma.inventoryMovement.create({
      data: {
        bookId: id,
        type: "INITIAL",
        quantity: stock,
        note: "Initial stock from seed",
      },
    });
  }

  console.log("Seeding coupons, banners, FAQs, settings...");
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        description: "10% off your first order (max ৳100).",
        type: "PERCENT",
        value: 10,
        minOrder: 300,
        maxDiscount: 100,
        isActive: true,
      },
      {
        code: "BOOKHAND50",
        description: "৳50 off orders over ৳500.",
        type: "FIXED",
        value: 50,
        minOrder: 500,
        isActive: true,
      },
      {
        code: "FREESHIP",
        description: "Free delivery on orders over ৳800.",
        type: "FREE_SHIPPING",
        value: 0,
        minOrder: 800,
        isActive: true,
      },
    ],
  });
  await prisma.banner.createMany({
    data: [
      {
        title: "Discover your next great read",
        subtitle: "New and used books from trusted sellers across Bangladesh.",
        href: "/books",
        isActive: true,
        order: 1,
      },
      {
        title: "Sell books from your shelf",
        subtitle:
          "Turn the books you have finished into someone else's next favourite.",
        href: "/register?role=seller",
        isActive: true,
        order: 2,
      },
    ],
  });
  await prisma.faq.createMany({
    data: [
      {
        question: "How do I track my order?",
        answer:
          "Open your buyer dashboard and visit My Orders. Each order shows its current status and tracking information once shipped.",
        order: 1,
      },
      {
        question: "Can I return a book?",
        answer:
          "Yes. Books can be returned within 7 days of delivery if they are materially different from the listing description. See our return policy for details.",
        order: 2,
      },
      {
        question: "How do I become a seller?",
        answer:
          "Register with the seller role, complete your shop profile, and start listing books. Admin approval may be required for payouts.",
        order: 3,
      },
      {
        question: "Which payment methods are supported?",
        answer:
          "We support Cash on Delivery, bKash, Nagad, and card payments. Payment availability may vary by seller and order value.",
        order: 4,
      },
      {
        question: "Are used books inspected?",
        answer:
          "Sellers are responsible for accurate condition descriptions. Buyers can report material discrepancies and request a refund.",
        order: 5,
      },
    ],
  });
  await prisma.siteSetting.createMany({
    data: [
      { key: "site_name", value: "BookHand" },
      { key: "support_email", value: "support@bookhand.com" },
      { key: "support_phone", value: "+8801700000000" },
      { key: "shipping_flat_rate", value: "60" },
      { key: "free_shipping_threshold", value: "800" },
      { key: "commission_rate", value: "5" },
      { key: "currency", value: "BDT" },
    ],
  });

  console.log("Seeding reviews and a sample order...");
  const reviewData = [
    {
      bookId: "book-2",
      userId: "user-buyer",
      rating: 5,
      title: "Life-changing",
      body: "One of the most practical books I have read. The ideas are simple and immediately useful.",
    },
    {
      bookId: "book-1",
      userId: "user-buyer",
      rating: 5,
      title: "A timeless story",
      body: "Beautifully written and inspiring. The copy arrived in excellent condition.",
    },
    {
      bookId: "book-7",
      userId: "user-buyer",
      rating: 4,
      title: "A classic for a reason",
      body: "Chilling and relevant. The seller packaged it carefully.",
    },
  ];
  for (const review of reviewData) {
    await prisma.review.create({ data: { ...review, isVerified: true } });
  }

  await prisma.order.create({
    data: {
      id: "order-sample-1",
      orderNumber: "BH-2026-0001",
      userId: "user-buyer",
      status: "DELIVERED",
      subtotal: 800,
      discount: 50,
      shipping: 60,
      total: 810,
      couponId: null,
      paymentMethod: "COD",
      paymentStatus: "PAID",
      addressSnapshot: JSON.stringify({
        recipientName: "Ayesha Rahman",
        phone: "+8801712345678",
        district: "Dhaka",
        city: "Dhaka",
        area: "Dhanmondi",
        postalCode: "1209",
        instructions: "Please call before delivery.",
      }),
      notes: "Sample order created by the seed script.",
      items: {
        create: [
          {
            bookId: "book-2",
            sellerId: "user-seller-2",
            shopId: "shop-readmore",
            title: "Atomic Habits",
            author: "James Clear",
            coverTone: 2,
            price: 480,
            quantity: 1,
            status: "DELIVERED",
          },
          {
            bookId: "book-1",
            sellerId: "user-seller-1",
            shopId: "shop-booknest",
            title: "The Alchemist",
            author: "Paulo Coelho",
            coverTone: 1,
            price: 320,
            quantity: 1,
            status: "DELIVERED",
          },
        ],
      },
      payment: { create: { provider: "COD", amount: 810, status: "PAID" } },
      shipment: {
        create: {
          status: "DELIVERED",
          carrier: "Pathao",
          trackingNumber: "PT-987654321",
          deliveredAt: new Date(),
        },
      },
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: "user-buyer",
        type: "ORDER",
        title: "Your order was delivered",
        message: "Order BH-2026-0001 has been delivered. Enjoy your books!",
        href: "/buyer/orders",
        isRead: false,
      },
      {
        userId: "user-buyer",
        type: "PROMO",
        title: "10% off your next order",
        message: "Use code WELCOME10 at checkout. Maximum discount ৳100.",
        href: "/books",
        isRead: false,
      },
      {
        userId: "user-seller-1",
        type: "ORDER",
        title: "New order received",
        message: "You have a new order to fulfil.",
        href: "/seller/orders",
        isRead: false,
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Admin:  admin@bookhand.com / Admin@12345");
  console.log("Seller: seller1@bookhand.com / Seller@12345");
  console.log("Buyer:  buyer@bookhand.com / Buyer@12345");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
