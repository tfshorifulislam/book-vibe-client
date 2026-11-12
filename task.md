# TASK.MD — BOOKHAND COMPLETE HOMEPAGE & NAVBAR IMPLEMENTATION

**Project:** BookHand — Book Marketplace  
**Task:** Complete Homepage Structure, Navbar Routes & Dynamic Sections  
**Priority:** High  
**Status:** To Do

---

# 1. OBJECTIVE

Build a complete, premium-quality BookHand Homepage with a fully functional Navbar and all required homepage sections.

The website should look and feel like a modern, premium online bookstore and multi-vendor marketplace.

### Main Requirements

1. Complete Navbar with all necessary public navigation routes.
2. No search bar in Navbar.
3. Complete Homepage with all specified sections.
4. Most homepage sections must display dynamic content.
5. All homepage components must live inside `components/home/`.
6. All colors must come from `globals.css`.
7. Support Light and Dark themes.
8. Use reusable and maintainable components.
9. Prepare dynamic sections for future backend/API integration.
10. Responsive design for Desktop, Tablet and Mobile.

# 2. NAVBAR — COMPLETE STRUCTURE

## 2.1 Navbar Layout

### Left Side

- BookHand Logo
- Brand name: BookHand

### Center — Navigation Links

1. Home → `/`
2. Browse Books → `/books`
3. Categories → Dropdown
4. Top Sellers → `/sellers`
5. About Us → `/about`

### Categories Dropdown

Display categories dynamically.

Example:

- Fiction
- Academic
- Islamic
- Children
- Science & Technology
- Business
- History
- Biography

Each category navigates to:

`/categories/[slug]`

Requirements:

- Fetch categories dynamically.
- Show category icons where available.
- Support subcategories.
- Include View All Categories → `/categories`.

### Right Side

Guest User:

- Login → `/login`
- Sign Up → `/register`
- Become a Seller → `/register?role=seller`

Authenticated Buyer:

- Wishlist → `/buyer/wishlist`
- Cart → `/buyer/cart`
- Messages → `/buyer/messages`
- Notification dropdown
- Profile dropdown
- My Dashboard → `/buyer/dashboard`
- Logout

Authenticated Seller:

- Messages → `/seller/messages`
- Notifications
- Profile dropdown
- Seller Dashboard → `/seller/dashboard`
- Logout

Admin:

- Admin Dashboard → `/admin/dashboard`
- Profile menu
- Logout

### Navbar Additional Requirements

- No search bar.
- Sticky navbar.
- Transparent or clean background at the top where appropriate.
- Show subtle bottom border when scrolling.
- Active navigation indicator.
- Smooth dropdown animation.
- Mobile hamburger menu.
- Responsive mobile navigation drawer.
- Light/Dark theme toggle.
- Proper keyboard accessibility.
- Role-based navigation.

Do not display Buyer and Seller dashboard links to unauthorized users.

# 3. HOMEPAGE — COMPLETE SECTION STRUCTURE

Route: `/`

Implement the following sections in the exact order.

## SECTION 01 — HERO SECTION

Purpose: Introduce BookHand and encourage users to discover books.

Content:

- Eyebrow: YOUR NEXT FAVORITE BOOK IS WAITING
- Heading: Discover Books. Share Knowledge.
- Supporting description
- Large book search bar
- Explore Books CTA → `/books`
- Become a Seller CTA → `/register?role=seller`
- Book-themed visual composition
- Featured book covers
- Floating book cards
- Trust indicators

Dynamic:

- Featured book information
- Search suggestions
- Popular search keywords

Search functionality:

- Search by book title
- Author
- ISBN
- Publisher

Search must navigate to `/search?q=keyword`.

## SECTION 02 — POPULAR CATEGORIES

Purpose: Help visitors discover books by category.

Content:

- Section heading
- Supporting description
- Category cards
- Category images/icons
- Category name
- Number of available books
- View All Categories CTA

Dynamic:

- Category name
- Category image
- Category slug
- Book count
- Category ordering
- Active/inactive status

API-ready:
`GET /api/categories`

Display approximately 6–8 categories.

## SECTION 03 — FEATURED BOOKS

Purpose: Highlight selected books.

Content:

- Section heading
- Description
- Featured book cards
- View All CTA

Each book card:

- Book cover
- Book title
- Author
- Publisher
- Current price
- Original price
- Discount badge
- Rating
- Condition
- Seller name
- Wishlist button
- Add to Cart button

Dynamic:

- Featured book collection
- Book information
- Pricing
- Availability
- Ratings
- Seller information

API-ready:
`GET /api/books/featured`

Display 4–8 books depending on screen size.

## SECTION 04 — BEST SELLING BOOKS

Purpose: Show popular books based on sales.

Content:

- Section heading
- Description
- Book cards
- Ranking indicator (optional)
- View All CTA

Dynamic:

- Sales ranking
- Total sales
- Book information
- Price
- Rating
- Stock status

API-ready:
`GET /api/books/best-selling`

Do not use randomly assigned popularity values.

## SECTION 05 — NEW ARRIVALS

Purpose: Display recently listed books.

Content:

- Section heading
- Description
- New Arrival badge
- Book cards
- View All CTA

Dynamic:

- Latest published listings
- Book information
- Listing date
- Price
- Condition
- Seller information

API-ready:
`GET /api/books/new-arrivals`

Sort by newest listing date.

## SECTION 06 — SPECIAL OFFERS

Purpose: Highlight discounts and promotional offers.

Content:

- Promotional banner
- Offer title
- Description
- Discount information
- Expiry information (when applicable)
- Shop Now CTA
- Discounted book collection

Dynamic:

- Promotional banner
- Offer title
- Discount percentage
- Start date
- Expiry date
- Eligible books
- Active status

API-ready:
`GET /api/offers/active`

Only display active offers.

Hide expired promotions automatically.

## SECTION 07 — TOP SELLERS

Purpose: Help buyers discover popular sellers and bookstores.

Content:

- Section heading
- Supporting description
- Seller cards
- Shop logo
- Shop name
- Seller rating
- Total books
- Total reviews
- Location
- Visit Shop CTA

Dynamic:

- Seller information
- Shop logo
- Rating
- Total listed books
- Review count
- Seller ranking

API-ready:
`GET /api/sellers/top`

Display approximately 4–6 sellers.

Do not display fake ratings or fabricated seller statistics.

## SECTION 08 — USED BOOKS COLLECTION

Purpose: Promote affordable second-hand books.

Content:

- Section heading
- Supporting description
- Used book cards
- Condition badges
- Original price (if available)
- Selling price
- Discount
- View All CTA

Dynamic:

- Used book listings
- Condition
- Price
- Availability
- Seller information

API-ready:
`GET /api/books?condition=USED`

Only display books with the USED condition.

## SECTION 09 — HOW BOOKHAND WORKS

Purpose: Explain how buyers and sellers use the platform.

Create two tabs:

### Buyer Journey

Step 01 — Discover Books

- Explore thousands of books.
- Find books by category, author and title.

Step 02 — Place Your Order

- Select your books.
- Add to cart and complete checkout.

Step 03 — Receive Your Books

- Track your order.
- Receive books and leave reviews.

CTA: Start Exploring → `/books`

### Seller Journey

Step 01 — Create Your Shop

- Register as a seller.
- Set up your bookstore.

Step 02 — List Your Books

- Upload book information.
- Set prices and stock.

Step 03 — Start Selling

- Receive orders.
- Manage sales and earnings.

CTA: Start Selling → `/register?role=seller`

Dynamic:

- Tab interaction
- Step content configurable through data.

## SECTION 10 — WHY CHOOSE BOOKHAND

Purpose: Communicate the platform's key benefits.

Content:

- Section heading
- Supporting description
- Feature cards

Suggested features:

1. Wide Book Collection
2. Independent Book Sellers
3. Easy Book Discovery
4. Multiple Payment Options
5. Buyer-Seller Communication
6. Simple Order Tracking

Dynamic:

- Feature title
- Description
- Icon
- Display order
- Visibility

Keep content configuration-driven.

Do not add fake security certifications or unsupported claims.

## SECTION 11 — TESTIMONIALS

Purpose: Build trust through real customer experiences.

Content:

- Section heading
- Description
- Testimonial cards
- Customer name
- Customer profile image
- Rating
- Review text
- Book purchased

Dynamic:

- Approved customer testimonials
- Customer profile
- Rating
- Review content
- Display order

API-ready:
`GET /api/testimonials`

Only display approved testimonials from genuine users.

If no testimonials exist, hide the section instead of showing fabricated reviews.

## SECTION 12 — NEWSLETTER SUBSCRIPTION

Purpose: Collect email subscribers.

Content:

- Heading: Stay Updated with BookHand
- Supporting description
- Email input
- Subscribe button
- Success feedback
- Error feedback

Dynamic:

- Newsletter submission
- Subscription status
- Success/error messages

API-ready:
`POST /api/newsletter/subscribe`

Include email validation and duplicate subscription handling.

## SECTION 13 — FINAL CTA SECTION

Purpose: Convert visitors into buyers and sellers.

Content:

- Heading: Your Next Chapter Starts Here.
- Description
- Explore Books CTA → `/books`
- Become a Seller CTA → `/register?role=seller`

Design:

- Book-inspired background
- Subtle brand gradient
- Two CTA buttons
- Responsive layout

Content should be configuration-driven.

## SECTION 14 — FOOTER

### Column 01 — Brand

- BookHand Logo
- Short brand description
- Social media links

### Column 02 — Explore

- Browse Books → `/books`
- Categories → `/categories`
- New Arrivals → `/books?sort=newest`
- Best Sellers → `/books?sort=popular`
- Top Sellers → `/sellers`

### Column 03 — For Users

- My Account → `/buyer/dashboard`
- Wishlist → `/buyer/wishlist`
- My Orders → `/buyer/orders`
- Become a Seller → `/register?role=seller`

### Column 04 — Company

- About Us → `/about`
- Contact Us → `/contact`
- FAQ → `/faq`

### Column 05 — Legal

- Privacy Policy → `/privacy-policy`
- Terms & Conditions → `/terms`
- Refund Policy → `/refund-policy`

### Bottom Footer

- Copyright
- Current year
- Payment method icons
- Social links
- Back to Top button

Dynamic:

- Footer navigation configuration
- Social media links
- Copyright year
- Payment method visibility

---

# 4. COMPLETE PUBLIC ROUTE STRUCTURE

Implement Navbar and Footer navigation using these routes.

| Page               | Route                |
| ------------------ | -------------------- |
| Home               | `/`                  |
| Browse Books       | `/books`             |
| All Categories     | `/categories`        |
| Category Details   | `/categories/[slug]` |
| Search Results     | `/search`            |
| Book Details       | `/books/[slug]`      |
| Top Sellers        | `/sellers`           |
| Seller Shop        | `/shop/[shopSlug]`   |
| About Us           | `/about`             |
| Contact Us         | `/contact`           |
| FAQ                | `/faq`               |
| Privacy Policy     | `/privacy-policy`    |
| Terms & Conditions | `/terms`             |
| Refund Policy      | `/refund-policy`     |
| Login              | `/login`             |
| Register           | `/register`          |
| Forgot Password    | `/forgot-password`   |
| Reset Password     | `/reset-password`    |
| Email Verification | `/verify-email`      |

Do not create duplicate routes for the same page.

# 5. COMPONENT FOLDER STRUCTURE

IMPORTANT:

All Homepage-specific components must be inside:

`src/components/home/`

Use the following suggested structure:

```text
src/
├── app/
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── home/
│   │   ├── index.ts
│   │   ├── HomePage.tsx
│   │   │
│   │   ├── hero/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── HeroSearch.tsx
│   │   │   └── HeroVisual.tsx
│   │   │
│   │   ├── categories/
│   │   │   ├── PopularCategories.tsx
│   │   │   └── CategoryCard.tsx
│   │   │
│   │   ├── books/
│   │   │   ├── FeaturedBooks.tsx
│   │   │   ├── BestSellingBooks.tsx
│   │   │   ├── NewArrivals.tsx
│   │   │   └── UsedBooks.tsx
│   │   │
│   │   ├── offers/
│   │   │   └── SpecialOffers.tsx
│   │   │
│   │   ├── sellers/
│   │   │   ├── TopSellers.tsx
│   │   │   └── SellerCard.tsx
│   │   │
│   │   ├── information/
│   │   │   ├── HowItWorks.tsx
│   │   │   └── WhyChooseBookHand.tsx
│   │   │
│   │   ├── testimonials/
│   │   │   └── Testimonials.tsx
│   │   │
│   │   ├── newsletter/
│   │   │   └── NewsletterSection.tsx
│   │   │
│   │   ├── cta/
│   │   │   └── FinalCTA.tsx
│   │   │
│   │   └── footer/
│   │       └── HomeFooter.tsx
│   │
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── MobileNavigation.tsx
│   │   └── ThemeToggle.tsx
│   │
│   └── shared/
│       ├── BookCard.tsx
│       ├── SectionHeading.tsx
│       ├── SectionContainer.tsx
│       ├── EmptyState.tsx
│       └── LoadingSkeleton.tsx
│
├── lib/
│   ├── utils.ts
│   └── constants.ts
│
└── types/
    ├── book.ts
    ├── category.ts
    ├── seller.ts
    └── offer.ts
```

Adapt the folder structure to the existing repository instead of creating duplicate folders or components.

### Important Architecture Rules

- `app/page.tsx` should remain clean.
- `HomePage.tsx` should compose all homepage sections.
- Each section should have its own component.
- Shared components should remain reusable.
- Navbar should be shared under `components/layout/`.
- Homepage-specific components must stay inside `components/home/`.
- Avoid one giant homepage component.

# 6. DYNAMIC CONTENT ARCHITECTURE

Most homepage sections must be dynamic and API-ready.

### Dynamic Sections

| Section        | Dynamic Data                        |
| -------------- | ----------------------------------- |
| Hero           | Featured book, search suggestions   |
| Categories     | Categories, book counts             |
| Featured Books | Featured listings                   |
| Best Selling   | Sales-based rankings                |
| New Arrivals   | Latest listings                     |
| Special Offers | Active promotions                   |
| Top Sellers    | Seller profiles and ratings         |
| Used Books     | Used listings                       |
| How It Works   | Configurable steps                  |
| Why Choose Us  | Configurable features               |
| Testimonials   | Approved reviews                    |
| Newsletter     | Subscription submission             |
| Final CTA      | Configurable content                |
| Footer         | Navigation and social configuration |

### Data Handling Requirements

1. Do not hardcode dynamic business data inside UI components.
2. Separate data types from presentation.
3. Prepare API service functions.
4. Use proper TypeScript interfaces.
5. Handle loading, error and empty states.
6. Do not show fake sales, ratings or reviews.
7. Use temporary fixtures only when clearly marked as development data.
8. Make future backend integration straightforward.

For MVP frontend development, mock data may be used through separate typed data files. Components must not depend directly on those mock files.

# 7. GLOBAL CSS — COLOR SYSTEM

IMPORTANT:

All colors must come from `src/app/globals.css`.

Do not hardcode colors inside components.

Use the existing BookHand brand palette:

- Book Brown: `#8B5E3C`
- Antique Gold: `#D6A85F`

Use semantic CSS variables for:

- Background
- Foreground
- Card
- Card foreground
- Primary
- Primary foreground
- Secondary
- Secondary foreground
- Muted
- Muted foreground
- Accent
- Accent foreground
- Border
- Input
- Ring

Create reusable gradient utilities using only the two brand colors.

Support:

- Light Theme
- Dark Theme

All sections, cards, buttons, text, borders and interactive states must respect the active theme.

Do not introduce random Tailwind color classes or component-level hexadecimal colors.

Preserve meaningful status colors where required by the existing design system.

# 8. DESIGN REQUIREMENTS

Visual direction:

**Premium Bookstore + Modern Marketplace**

Requirements:

- Clean and elegant layout.
- Book-inspired visual identity.
- Consistent section spacing.
- Consistent typography.
- Beautiful book cards.
- Refined hover animations.
- Subtle shadows.
- Consistent border radius.
- High-quality book imagery.
- Balanced use of gradients.
- Strong visual hierarchy.

Avoid:

- Generic AI-generated SaaS appearance.
- Excessive gradients.
- Excessive whitespace.
- Unnecessary floating elements.
- Random icons.
- Fake testimonials.
- Fake statistics.
- Repeated content.
- Excessive animations.

Use the existing UI library and icon library.

Never use the Sparkles icon.

# 9. RESPONSIVE REQUIREMENTS

### Desktop

- Full Navbar
- Multi-column book grids
- Full-width hero composition
- Proper section alignment

### Tablet

- Responsive navigation
- Two-column book grids where appropriate
- Balanced spacing

### Mobile

- Mobile navigation drawer
- Single-column hero
- Responsive search
- Two-column compact book grids where readable
- Stacked promotional banners where needed
- No horizontal overflow

Test at:

- 1440px
- 1024px
- 768px
- 375px

# 10. FUNCTIONAL REQUIREMENTS

All interactive elements must work.

- Navbar links navigate correctly.
- Category dropdown works.
- Mobile navigation works.
- Theme toggle works.
- Hero search submits a query.
- Category cards navigate correctly.
- Book cards open book details.
- Wishlist buttons perform the intended action or show an appropriate authentication prompt.
- Add to Cart works or redirects guests to login.
- Seller cards open seller shops.
- CTA buttons navigate correctly.
- Newsletter form validates email.
- Carousel controls work if carousels are used.
- View All buttons navigate to the correct listing pages.

Do not create decorative buttons without functionality.

# 11. IMPLEMENTATION ORDER

Follow this order:

1. Inspect the existing project and architecture.
2. Verify and finalize `globals.css`.
3. Implement Navbar and public navigation.
4. Create the `components/home/` structure.
5. Implement Hero Section.
6. Implement Popular Categories.
7. Implement Featured Books.
8. Implement Best Selling Books.
9. Implement New Arrivals.
10. Implement Special Offers.
11. Implement Top Sellers.
12. Implement Used Books.
13. Implement How BookHand Works.
14. Implement Why Choose BookHand.
15. Implement Testimonials.
16. Implement Newsletter.
17. Implement Final CTA.
18. Implement Footer.
19. Verify all dynamic states.
20. Test Light and Dark themes.
21. Test responsiveness and navigation.
22. Run lint and production build.

# 12. FINAL ACCEPTANCE CHECKLIST

### Navbar

- [ ] Correct public routes
- [ ] No Navbar search bar
- [ ] Categories dropdown
- [ ] Guest navigation
- [ ] Role-based authenticated navigation
- [ ] Mobile navigation
- [ ] Theme toggle
- [ ] Active route indicator

### Homepage

- [ ] Hero
- [ ] Popular Categories
- [ ] Featured Books
- [ ] Best Selling Books
- [ ] New Arrivals
- [ ] Special Offers
- [ ] Top Sellers
- [ ] Used Books
- [ ] How BookHand Works
- [ ] Why Choose BookHand
- [ ] Testimonials
- [ ] Newsletter
- [ ] Final CTA
- [ ] Footer

### Architecture

- [ ] Homepage components inside `components/home/`
- [ ] Shared Navbar under layout
- [ ] Reusable shared components
- [ ] Clean `app/page.tsx`
- [ ] Proper TypeScript types
- [ ] Separated data and UI

### Design

- [ ] All colors from `globals.css`
- [ ] Light Theme correct
- [ ] Dark Theme correct
- [ ] Consistent gradients
- [ ] Responsive all devices
- [ ] No broken images
- [ ] No horizontal overflow

### Functionality

- [ ] Search works
- [ ] Navigation works
- [ ] Category links work
- [ ] Book links work
- [ ] Seller links work
- [ ] CTA buttons work
- [ ] Newsletter validation works
- [ ] Loading states work
- [ ] Empty states work
- [ ] Error states work

### Final Validation

- [ ] No console errors
- [ ] No hydration errors
- [ ] No broken routes
- [ ] No unnecessary dependencies
- [ ] Lint passes
- [ ] Production build succeeds

# 13. IMPORTANT FINAL INSTRUCTIONS

- Implement the complete Homepage, not just the Hero Section.
- Do not implement other public pages or dashboards in this task.
- Do not implement backend functionality.
- Prepare all dynamic sections for future API integration.
- Do not create unnecessary mock backend infrastructure.
- Do not use fake production statistics.
- Do not hardcode colors in individual components.
- Follow the existing project architecture.
- Do not stop after implementing only a few sections.
- Verify every section before reporting completion.

**Deliverable:** A complete, responsive, premium BookHand Homepage with functional Navbar, dynamic-ready sections, reusable components, and consistent Light/Dark themes.

---

**BOOKHAND — Discover Books. Share Knowledge.**
