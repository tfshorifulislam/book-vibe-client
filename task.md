# BOOKHAND — Complete Bookselling E-commerce Platform

## Full Website Development Task

**Project:** BookHand  
**Project Type:** Full-stack Bookselling E-commerce Marketplace  
**Primary Market:** Bangladesh  
**Design System:** shadcn/ui + Tailwind CSS  
**Theme:** Premium Light & Dark  
**Development Goal:** Production-ready, scalable, secure, fully functional marketplace.

---

# 1. PRIMARY OBJECTIVE

Transform the existing BookHand project into a complete, modern, production-ready online bookselling marketplace.

BookHand will allow:

- Customers to discover, browse, purchase, review, and track books.
- Sellers to create shops, publish books, manage inventory, and process orders.
- Administrators to manage the entire marketplace, users, sellers, books, orders, payments, and platform settings.

This must be a fully functional e-commerce platform, not just a UI prototype.

**IMPORTANT:** Before implementing anything, inspect the entire existing project. Understand the current routes, components, database schema, APIs, authentication, business logic, and existing features.

Do not unnecessarily rebuild or duplicate existing working systems. Improve and extend the existing architecture.

---

# 2. DEVELOPMENT PERMISSIONS

Allow the coding agent the required permissions to complete the project.

Grant permission for:

- Reading and modifying all project files.
- Creating, updating, moving, and deleting project files when necessary.
- Creating new folders and components.
- Installing and updating required npm packages.
- Running terminal commands.
- Running development servers.
- Running database migrations and Prisma commands.
- Generating database clients.
- Running lint, typecheck, tests, and production builds.
- Creating and modifying environment variable examples.
- Updating configuration files.
- Installing and configuring shadcn/ui components.
- Modifying existing API routes and backend services.
- Refactoring existing components and code.
- Updating package scripts and project dependencies.
- Running Git commands required for development.
- Accessing documentation and package resources when network access is available.

Do not stop for confirmation for ordinary, reversible development operations.

For destructive operations involving production databases, real customer data, deployed environments, credentials, or irreversible external actions, preserve data and require explicit authorization.

Never expose secrets, API keys, passwords, or private environment variables in source code, logs, or Git commits.

---

# 3. PROJECT AUDIT — FIRST PRIORITY

Before writing code, inspect:

1. Complete frontend structure.
2. Complete backend structure.
3. Existing routes and pages.
4. Existing reusable components.
5. Existing authentication system.
6. Existing user roles and permissions.
7. Database schema and relationships.
8. Existing API endpoints.
9. API services and hooks.
10. Form validation.
11. State management.
12. Existing UI libraries.
13. Global CSS and theme configuration.
14. Existing environment variables.
15. Existing payment, upload, notification, and messaging integrations.
16. Existing tests and project scripts.

Create an internal implementation plan based on the audit.

Identify:

- Already implemented features.
- Partially implemented features.
- Missing features.
- Broken features.
- Duplicate implementations.
- Security problems.
- Database and API inconsistencies.

Preserve working features and fix incomplete implementations.

Do not create duplicate routes, components, APIs, services, or database models.

---

# 4. TECHNOLOGY AND ARCHITECTURE

Preserve the existing project stack wherever possible.

Expected architecture:

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- React Hook Form
- Zod
- TanStack Query where appropriate
- Existing state management solution

### Backend

Preserve the existing backend framework and architecture.

Expected capabilities:

- REST API
- Authentication and authorization
- Service and controller architecture
- Request validation
- Centralized error handling
- Database transactions
- Role-based access control

### Database

Preserve the existing database technology and ORM.

Use properly related database entities, indexes, constraints, and migrations.

### File Storage

- Cloudinary or existing compatible storage.
- Book cover uploads.
- User avatars.
- Seller shop images.
- Chat attachments where supported.

### Real-time Features

Use the existing Socket.IO implementation if available for:

- Chat.
- Notifications.
- Order updates.
- Live events where necessary.

Do not replace working technologies without a clear technical reason.

---

# 5. GLOBAL DESIGN SYSTEM

## 5.1 UI Library

Use shadcn/ui as the primary component library.

Prefer existing shadcn/ui components for:

- Button
- Input
- Textarea
- Select
- Checkbox
- Radio Group
- Switch
- Dialog
- Alert Dialog
- Sheet
- Drawer
- Dropdown Menu
- Navigation Menu
- Popover
- Tooltip
- Tabs
- Accordion
- Card
- Badge
- Avatar
- Breadcrumb
- Pagination
- Table
- Skeleton
- Calendar
- Command
- Form
- Separator
- Progress
- Toast / Sonner

Do not create custom versions of components that already exist in shadcn/ui unless customization is genuinely necessary.

## 5.2 Global CSS Rules

**CRITICAL REQUIREMENT: All colors and typography must come from the global CSS design system.**

Use `globals.css` as the single source of truth.

Define and maintain CSS variables for:

- Background
- Foreground
- Card
- Popover
- Primary
- Secondary
- Muted
- Accent
- Destructive
- Border
- Input
- Ring
- Sidebar
- Success
- Warning
- Information
- Chart colors
- Brand colors

Also define global typography tokens:

- Font family
- Heading sizes
- Body sizes
- Small text
- Line heights
- Font weights

Rules:

1. Never hardcode hex, RGB, HSL, or arbitrary colors inside components.
2. Never introduce separate color systems for individual pages.
3. Use CSS variables and Tailwind semantic tokens.
4. Maintain consistent spacing and border radius.
5. Support light and dark themes.
6. All components must look correct in both themes.
7. Avoid excessive gradients, shadows, and decorative effects.
8. Keep the design clean, premium, readable, and professional.

Do not use arbitrary font sizes throughout individual components. Follow the global typography scale.

## 5.3 Design Quality

The website should feel like a professional bookstore marketplace.

Design principles:

- Clean layouts.
- Strong visual hierarchy.
- Consistent spacing.
- Readable typography.
- High-quality book covers.
- Responsive grids.
- Subtle animations.
- Accessible interactions.
- Consistent buttons and forms.
- Proper empty states.
- No unnecessary whitespace.
- No oversized cards.
- No repetitive sections.
- No generic AI-generated design patterns.

---

# 6. USER ROLES AND ACCESS CONTROL

Implement three primary roles.

## Buyer

Can:

- Browse books.
- Search and filter books.
- View book details.
- Add books to cart.
- Manage wishlist.
- Place orders.
- Make payments.
- Track orders.
- Write reviews.
- Ask questions.
- Chat with sellers.
- Manage profile and addresses.
- Apply coupons.
- Submit disputes and support requests.

## Seller

Can:

- Create and manage a shop.
- Manage books.
- Upload book covers.
- Manage inventory.
- Manage orders.
- Update order status.
- Manage coupons where permitted.
- Communicate with buyers.
- View sales analytics.
- Manage shop information.
- View earnings and payout information.

## Admin

Can:

- Manage buyers.
- Manage sellers.
- Manage books and categories.
- Manage shops.
- Manage orders.
- Manage transactions.
- Manage coupons.
- Manage reviews.
- Manage disputes.
- Manage reports.
- Manage platform settings.
- View analytics.
- Manage homepage content.
- Configure supported payment and delivery settings.

Implement proper role-based route guards and backend authorization.

Hiding a button on the frontend is not authorization. Every protected operation must also be validated by the backend.

Seller verification and two-factor authentication are outside the current scope. Do not introduce them as mandatory workflows.

---

# 7. COMPLETE WEBSITE ROUTES

Audit the existing route structure first. Preserve existing URLs when possible and map the following functionality to the appropriate routes.

## 7.1 Public Website

### Main Pages

- `/` — Homepage
- `/books` — All Books
- `/books/[slug]` — Book Details
- `/categories` — All Categories
- `/categories/[slug]` — Category Books
- `/authors` — All Authors
- `/authors/[slug]` — Author Details
- `/publishers` — Publishers
- `/publishers/[slug]` — Publisher Details
- `/shops` — All Seller Shops
- `/shops/[slug]` — Seller Shop Details
- `/deals` — Offers and Deals
- `/new-arrivals` — Newly Added Books
- `/best-sellers` — Best-selling Books
- `/featured-books` — Featured Books
- `/search` — Search Results

### Information Pages

- `/about`
- `/contact`
- `/faq`
- `/help`
- `/shipping-policy`
- `/return-policy`
- `/refund-policy`
- `/privacy-policy`
- `/terms`
- `/cookie-policy`

### Authentication Pages

- `/login`
- `/register`
- `/register/buyer`
- `/register/seller`
- `/forgot-password`
- `/reset-password`
- `/verify-email`
- `/auth/callback`

Support email/password authentication and Google OAuth if already configured.

Implement email verification and password reset workflows.

---

# 8. HOMEPAGE — COMPLETE IMPLEMENTATION

Create a premium, dynamic homepage.

Keep all homepage-specific components inside a dedicated `home` folder under the existing components structure.

Suggested structure:

`components/home/`

- HomePage
- HomeHero
- HomeCategories
- FeaturedBooks
- BestSellingBooks
- NewArrivals
- PopularAuthors
- FeaturedPublishers
- FeaturedShops
- PromotionalBanner
- BookDeals
- RecommendedBooks
- RecentlyViewedBooks
- TrendingBooks
- NewsletterSection
- HomeTestimonials
- HomeFAQ
- HomeCTA

Adapt names and structure to the existing project conventions.

## Homepage Sections

1. Hero section.
2. Popular book categories.
3. Featured books.
4. Best-selling books.
5. New arrivals.
6. Trending books.
7. Special offers.
8. Popular authors.
9. Featured publishers.
10. Featured seller shops.
11. Personalized recommendations for logged-in buyers.
12. Recently viewed books.
13. Newsletter subscription.
14. Customer testimonials, only when real authorized content exists.
15. Frequently asked questions.
16. Final CTA.
17. Footer.

Most sections should be dynamically populated from backend APIs.

Requirements:

- Dynamic book data.
- Dynamic categories.
- Dynamic author data.
- Dynamic promotions.
- Dynamic section visibility where configurable.
- Loading skeletons.
- Empty states.
- Error handling.
- Responsive layouts.
- Proper navigation to detail pages.

Do not use fabricated sales figures, ratings, customer counts, or fake testimonials.

If there is no real content, hide the corresponding section or display a proper empty state.

---

# 9. BOOK LISTING AND DISCOVERY

## `/books`

Implement a complete book discovery experience.

Features:

- Search by title.
- Search by author.
- Search by ISBN where supported.
- Category filters.
- Author filters.
- Publisher filters.
- Price range.
- Availability filters.
- Language filters.
- Book condition filters if the marketplace supports used books.
- Rating filters where appropriate.
- Sorting.
- Pagination.
- Clear all filters.
- Active filter indicators.

Sorting options:

- Featured
- Newest
- Oldest
- Price: Low to High
- Price: High to Low
- Title: A to Z
- Most Popular
- Highest Rated

Book cards should support:

- Cover image.
- Book title.
- Author.
- Category.
- Current price.
- Original price where applicable.
- Discount label where applicable.
- Rating and review count when available.
- Stock availability.
- Wishlist action.
- Book details navigation.
- Add to cart where appropriate.

Use real API data, not permanent mock data.

The navbar must not contain a search bar. Search functionality belongs on relevant discovery pages and dedicated search interfaces.

---

# 10. BOOK DETAILS PAGE

## `/books/[slug]`

Implement:

- Book cover gallery.
- Book title.
- Author.
- Publisher.
- ISBN.
- Category.
- Edition.
- Language.
- Publication date.
- Page count.
- Book description.
- Price.
- Discount.
- Stock availability.
- Quantity selector.
- Add to cart.
- Buy now.
- Add to wishlist.
- Seller/shop information.
- Delivery information.
- Return policy.
- Ratings and reviews.
- Customer questions and answers.
- Related books.
- Recently viewed books.

Only show metadata supported by the database.

Prevent purchases exceeding available stock.

---

# 11. SHOPPING CART

## `/cart`

Implement a complete cart system.

Features:

- Add to cart.
- Remove from cart.
- Update quantity.
- Select and deselect items.
- Cart subtotal.
- Discount calculation.
- Coupon application.
- Shipping estimate.
- Total price.
- Stock validation.
- Out-of-stock handling.
- Continue shopping.
- Proceed to checkout.

Cart data should remain available across sessions for authenticated buyers.

Prevent duplicate or inconsistent cart entries.

Validate prices and quantities on the backend. Never trust client-calculated totals.

---

# 12. CHECKOUT SYSTEM

## `/checkout`

Build a complete checkout process.

### Step 1: Address

- Select saved address.
- Add new address.
- Edit address.
- Set default address.
- Validate recipient information.
- Phone number.
- District.
- City.
- Area.
- Postal code where applicable.
- Delivery instructions.

### Step 2: Order Review

- Selected books.
- Quantity.
- Item subtotal.
- Coupon discount.
- Shipping cost.
- Grand total.

### Step 3: Payment

Support payment methods according to configured availability:

- Cash on Delivery.
- bKash.
- SSLCommerz.
- Stripe for supported international transactions.

### Step 4: Confirmation

- Create order.
- Confirm payment status.
- Show order number.
- Display order summary.
- Provide order details link.

Important:

- Calculate all prices on the server.
- Use database transactions for order creation.
- Validate inventory before confirming.
- Prevent duplicate order submissions.
- Verify payment callbacks and webhooks.
- Never mark an order paid based only on a frontend success redirect.

---

# 13. ORDER MANAGEMENT — BUYER

Routes:

- `/account/orders`
- `/account/orders/[id]`

Features:

- Order history.
- Order details.
- Order items.
- Payment status.
- Delivery status.
- Order timeline.
- Tracking information.
- Cancel order where permitted.
- Request return.
- Request refund.
- Download invoice.
- Contact seller.
- Reorder.

Use proper order status transitions.

Suggested statuses:

- Pending
- Confirmed
- Processing
- Shipped
- Out for Delivery
- Delivered
- Cancelled
- Return Requested
- Returned
- Refunded

Only allow valid transitions.

---

# 14. BUYER ACCOUNT DASHBOARD

Routes:

- `/account`
- `/account/profile`
- `/account/addresses`
- `/account/orders`
- `/account/wishlist`
- `/account/reviews`
- `/account/questions`
- `/account/messages`
- `/account/notifications`
- `/account/coupons`
- `/account/settings`

Dashboard overview:

- Total orders.
- Recent orders.
- Pending orders.
- Wishlist count.
- Recent activity.
- Notifications.

Profile:

- Name.
- Email.
- Phone.
- Avatar.
- Profile editing.

Addresses:

- Create.
- Update.
- Delete.
- Set default.

Wishlist:

- Add.
- Remove.
- Move to cart.

Reviews:

- Create reviews for eligible purchases.
- Edit own reviews where permitted.
- Delete own reviews where permitted.
- View review history.

Questions:

- Ask questions about books.
- View answers.
- Follow up where permitted.

Settings:

- Account preferences.
- Notification preferences.
- Password change.
- Account deletion request.

---

# 15. SELLER SYSTEM

## Seller Routes

- `/seller`
- `/seller/onboarding`
- `/seller/shop`
- `/seller/shop/settings`
- `/seller/books`
- `/seller/books/create`
- `/seller/books/[id]/edit`
- `/seller/categories`
- `/seller/inventory`
- `/seller/orders`
- `/seller/orders/[id]`
- `/seller/customers`
- `/seller/reviews`
- `/seller/questions`
- `/seller/coupons`
- `/seller/messages`
- `/seller/notifications`
- `/seller/analytics`
- `/seller/earnings`
- `/seller/payouts`
- `/seller/settings`

## Seller Dashboard

Display:

- Total sales.
- Total orders.
- Total books.
- Pending orders.
- Completed orders.
- Revenue.
- Recent sales.
- Best-selling books.
- Sales chart.
- Order chart.
- Inventory alerts.

All analytics must use actual backend data.

## Shop Management

- Shop name.
- Shop slug.
- Shop logo.
- Shop banner.
- Shop description.
- Contact information.
- Address.
- Social links.
- Shop status.

## Book Management

Seller can:

- Create a book.
- Edit a book.
- Delete or archive a book.
- Upload book covers.
- Add multiple images.
- Select categories.
- Add authors and publishers.
- Set price.
- Set discount where permitted.
- Set stock quantity.
- Set ISBN.
- Add descriptions and metadata.
- Publish or save as draft.

Validate ownership and permissions on every operation.

## Inventory Management

- Current stock.
- Low stock alerts.
- Out-of-stock books.
- Stock adjustments.
- Inventory history.
- Prevent negative stock.
- Track reserved quantities where needed.

## Seller Orders

- View orders.
- View order details.
- Confirm orders.
- Update processing status.
- Mark orders shipped.
- Add tracking information.
- View delivery status.
- Handle permitted cancellation and return workflows.

## Earnings and Payouts

- Gross sales.
- Platform commission.
- Refund deductions.
- Net earnings.
- Pending balance.
- Available balance.
- Payout history.

Never calculate financial balances only in the frontend.

Use auditable transaction records.

---

# 16. ADMIN DASHBOARD

## Admin Routes

- `/admin`
- `/admin/analytics`
- `/admin/users`
- `/admin/users/[id]`
- `/admin/sellers`
- `/admin/sellers/[id]`
- `/admin/shops`
- `/admin/books`
- `/admin/books/[id]`
- `/admin/categories`
- `/admin/authors`
- `/admin/publishers`
- `/admin/orders`
- `/admin/orders/[id]`
- `/admin/payments`
- `/admin/transactions`
- `/admin/refunds`
- `/admin/commissions`
- `/admin/payouts`
- `/admin/coupons`
- `/admin/reviews`
- `/admin/questions`
- `/admin/disputes`
- `/admin/reports`
- `/admin/notifications`
- `/admin/content`
- `/admin/banners`
- `/admin/faqs`
- `/admin/newsletter`
- `/admin/settings`
- `/admin/settings/general`
- `/admin/settings/payments`
- `/admin/settings/shipping`
- `/admin/settings/commission`
- `/admin/settings/email`

## Admin Dashboard Overview

Display:

- Total revenue.
- Total orders.
- Total users.
- Total sellers.
- Total books.
- Active shops.
- Pending payments.
- Pending disputes.
- Recent transactions.
- Sales chart.
- Revenue chart.
- Order chart.
- Top-selling books.
- Top-performing sellers.

## User Management

- List users.
- Search users.
- Filter users.
- View user details.
- Update permitted account information.
- Suspend and reactivate accounts.
- Manage roles under controlled authorization.

## Seller and Shop Management

- View sellers.
- View shops.
- Manage shop status.
- Suspend or reactivate shops.
- View seller performance.
- View seller orders and books.

## Catalog Management

- Manage books.
- Manage categories.
- Manage authors.
- Manage publishers.
- Feature or unfeature books.
- Manage reported listings.

## Order and Financial Management

- View all orders.
- View order details.
- Track payment transactions.
- Manage refunds.
- Manage disputes.
- Configure commissions.
- Review payout requests.
- Maintain financial audit records.

## Content Management

Admin should be able to manage:

- Homepage banners.
- Featured books.
- Featured categories.
- Promotional sections.
- FAQ entries.
- Public announcements.
- Newsletter content.

Only implement a manageable CMS for the actual website features required. Do not introduce an unrelated or oversized CMS.

---

# 17. WISHLIST SYSTEM

Buyer features:

- Add books to wishlist.
- Remove books.
- View wishlist.
- Move item to cart.
- Check availability.
- Handle deleted or unavailable books.

Use authenticated database-backed persistence.

---

# 18. REVIEW AND RATING SYSTEM

Features:

- Star rating.
- Written review.
- Optional images if supported.
- Verified purchase indicator.
- Edit own review.
- Delete own review.
- Admin moderation.
- Report inappropriate reviews.

Prevent duplicate reviews for the same eligible purchase unless the existing business rules allow updates.

Calculate rating aggregates on the backend.

---

# 19. QUESTION AND ANSWER SYSTEM

Book-level Q&A:

- Buyers can ask questions.
- Sellers can respond to questions about their books.
- Buyers can view answers.
- Admin can moderate content.
- Notification when a question receives an answer.

Validate seller ownership and question permissions.

---

# 20. REAL-TIME CHAT SYSTEM

Implement buyer-seller messaging.

Features:

- Conversation list.
- One-to-one conversations.
- Message history.
- Text messages.
- Attachment support where configured.
- Read receipts.
- Unread count.
- Online status where supported.
- Real-time message delivery.
- Notification on new messages.

Use Socket.IO if already present.

Protect conversations so only authorized participants can access them.

---

# 21. NOTIFICATION SYSTEM

Notification types:

- Account updates.
- Order updates.
- Payment updates.
- Shipping updates.
- New messages.
- Review replies.
- Question answers.
- Coupon announcements.
- Seller updates.
- Admin announcements.

Features:

- In-app notifications.
- Unread count.
- Mark as read.
- Mark all as read.
- Notification preferences.
- Real-time updates where supported.

Do not send unnecessary notifications.

---

# 22. COUPON AND DISCOUNT SYSTEM

Admin and authorized sellers can create coupons according to platform rules.

Coupon types:

- Fixed amount.
- Percentage discount.
- Free shipping where supported.

Fields:

- Coupon code.
- Description.
- Discount type.
- Discount value.
- Minimum order amount.
- Maximum discount.
- Start date.
- Expiration date.
- Usage limit.
- Per-user usage limit.
- Active/inactive status.

Validate all coupon rules on the backend.

Prevent expired, invalid, and overused coupons from being applied.

---

# 23. PAYMENT SYSTEM

Support payment integrations according to the actual business configuration.

### Bangladesh

- Cash on Delivery.
- bKash.
- SSLCommerz.

### International

- Stripe, when configured and legally supported.

Implement:

- Payment initiation.
- Payment verification.
- Webhook handling.
- Transaction records.
- Payment status.
- Failed payment handling.
- Refund tracking.
- Idempotent callbacks.
- Payment audit logs.

Never store raw card details.

Never trust frontend payment status.

Do not use real payment credentials in development.

Provide `.env.example` with placeholder values.

---

# 24. SHIPPING AND DELIVERY SYSTEM

Features:

- Delivery address.
- Delivery charge calculation.
- Delivery zones.
- District-based delivery settings.
- Shipping method selection.
- Estimated delivery information.
- Tracking number.
- Shipment status.
- Delivery history.

Allow Admin to configure delivery charges and supported delivery options.

Do not claim live courier integration unless an actual courier API is configured.

---

# 25. RETURN, REFUND AND DISPUTE SYSTEM

Buyer:

- Request cancellation.
- Request return.
- Request refund.
- Submit dispute.
- Provide reason.
- Upload supporting attachments where supported.
- View request status.

Seller:

- Review eligible requests.
- Respond to disputes.
- Provide relevant order information.

Admin:

- Review disputes.
- Review evidence.
- Approve or reject requests.
- Record decisions.
- Track refunds.

Maintain an audit trail for all financial and dispute-related decisions.

---

# 26. SEARCH SYSTEM

Implement a useful book discovery search.

Searchable fields:

- Book title.
- Author.
- ISBN.
- Publisher.
- Category.

Features:

- Search results.
- Search filters.
- Sorting.
- Pagination.
- Empty state.
- Recent searches where appropriate.
- Search suggestions where supported.

Use backend search and database indexes.

Do not put a search bar in the navbar.

---

# 27. EMAIL SYSTEM

Implement email notifications for important events.

Examples:

- Account verification.
- Password reset.
- Order confirmation.
- Payment confirmation.
- Order shipment.
- Refund updates.
- Seller order notifications.

Use an existing or configured email provider.

Use reusable email templates.

Do not expose email provider credentials.

---

# 28. DATABASE DESIGN

Audit the existing database first.

Implement or extend normalized models for the following entities where needed:

### Identity

- User
- UserProfile
- UserAddress
- AccountSession where needed

### Seller

- SellerProfile
- Shop

### Catalog

- Book
- BookImage
- Category
- Author
- Publisher
- BookAuthor where applicable

### Commerce

- Cart
- CartItem
- Wishlist
- WishlistItem
- Order
- OrderItem
- Payment
- Transaction
- Shipment
- Coupon
- CouponUsage

### Engagement

- Review
- Question
- Answer
- Conversation
- ConversationParticipant
- Message
- Notification

### Operations

- InventoryMovement
- ReturnRequest
- Refund
- Dispute
- Payout
- Commission
- NewsletterSubscription
- SiteSetting
- HomepageSection
- Banner
- AuditLog

Use appropriate:

- Primary keys.
- Foreign keys.
- Unique constraints.
- Database indexes.
- Timestamps.
- Soft deletion where appropriate.
- Transactions for financial and inventory operations.

Avoid duplicating existing models.

Use precise decimal or integer-based monetary storage. Do not use floating-point arithmetic for financial calculations.

---

# 29. API AND BACKEND REQUIREMENTS

Follow the existing backend architecture.

Organize backend code into clear responsibilities:

- Routes.
- Controllers.
- Services.
- Repositories where appropriate.
- Middleware.
- Validators.
- Utilities.
- Types.
- Configuration.

Implement:

- Authentication middleware.
- Role authorization.
- Input validation.
- Centralized error handling.
- Pagination.
- Filtering.
- Sorting.
- Consistent API responses.
- Database transaction handling.
- File upload validation.
- Rate limiting for sensitive endpoints.
- Secure payment callbacks.
- Audit logging for critical operations.

Do not put business logic directly into route handlers.

Do not invent endpoints without implementing their backend behavior.

---

# 30. FRONTEND ARCHITECTURE

Maintain reusable components and a clean folder structure.

Suggested structure, adapted to the existing project:

```text
src/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── account/
│   ├── seller/
│   └── admin/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── home/
│   ├── books/
│   ├── cart/
│   ├── checkout/
│   ├── account/
│   ├── seller/
│   ├── admin/
│   └── shared/
│
├── hooks/
├── lib/
├── services/
├── schemas/
├── types/
├── constants/
└── styles/
```

Do not blindly copy this structure. Follow existing conventions and avoid unnecessary restructuring.

Requirements:

- Reusable components.
- Reusable forms.
- Shared validation schemas.
- Centralized API client.
- Proper loading states.
- Error boundaries where appropriate.
- Consistent toast notifications.
- Proper empty states.
- Responsive layouts.
- Accessible components.

Avoid giant page components. Split complex pages into maintainable components.

---

# 31. NAVIGATION AND LAYOUT

Create consistent layouts for:

### Public Layout

- Main navbar.
- Main content.
- Footer.
- Mobile navigation.

Navbar should include:

- BookHand logo.
- Home.
- Books.
- Categories.
- Authors.
- Shops.
- Deals.
- Account actions.
- Cart.
- Theme toggle.

Do not include a navbar search bar.

Show authenticated user navigation appropriately.

### Buyer Dashboard Layout

- Sidebar.
- Dashboard header.
- Main content.
- Responsive mobile navigation.

### Seller Dashboard Layout

- Seller sidebar.
- Dashboard header.
- Shop context.
- Main content.

### Admin Dashboard Layout

- Admin sidebar.
- Admin header.
- Main content.
- Role-protected navigation.

Keep navigation responsive and consistent.

---

# 32. RESPONSIVENESS

All pages must work properly on:

- 320px mobile.
- 375px mobile.
- 425px mobile.
- 768px tablet.
- 1024px laptop.
- 1280px desktop.
- 1440px desktop.
- Large screens.

Requirements:

- No horizontal overflow.
- Responsive tables.
- Mobile-friendly forms.
- Responsive dialogs and drawers.
- Proper mobile navigation.
- Responsive book grids.
- Responsive dashboard sidebars.
- Touch-friendly buttons.
- Proper image sizing.

Do not implement desktop-only layouts.

---

# 33. SECURITY REQUIREMENTS

Implement:

- Secure authentication.
- Password hashing.
- Secure cookie/session configuration according to the existing auth architecture.
- CSRF protection where applicable.
- XSS protection.
- Input validation.
- SQL injection protection through safe ORM/database queries.
- Rate limiting.
- Secure file upload validation.
- Authorization checks.
- Ownership checks.
- Payment verification.
- Webhook signature verification.
- Sensitive data protection.
- Safe error responses.
- Audit logs for sensitive actions.

Never trust:

- Frontend prices.
- Frontend roles.
- Frontend stock values.
- Frontend payment status.
- Frontend seller ownership.
- Frontend discount calculations.

The backend must be the source of truth.

---

# 34. SEO AND PERFORMANCE

Implement:

- Page-specific metadata.
- Dynamic title and description.
- Canonical URLs.
- Open Graph metadata.
- Social sharing metadata.
- Sitemap.
- Robots configuration.
- Structured data for books and applicable content.
- Semantic HTML.
- Optimized images.
- Lazy loading.
- Pagination.
- Appropriate caching.
- Efficient database queries.

Do not expose private account or dashboard pages to search engines.

Target strong Core Web Vitals and accessibility.

---

# 35. ERROR, LOADING AND EMPTY STATES

Every data-driven page must handle:

- Initial loading.
- Background loading.
- Empty data.
- API failure.
- Network failure.
- Unauthorized access.
- Forbidden access.
- Not found.
- Validation errors.
- Out-of-stock items.
- Payment failure.

Use shadcn/ui skeletons, alerts, dialogs, and toast notifications where appropriate.

Do not leave blank screens or broken loading indicators.

---

# 36. TESTING AND QUALITY ASSURANCE

Test all critical workflows.

### Authentication

- Register.
- Login.
- Logout.
- Email verification.
- Password reset.
- Role-based access.

### Buyer

- Browse books.
- Search.
- Filter.
- Sort.
- Pagination.
- Book details.
- Wishlist.
- Cart.
- Checkout.
- Payment.
- Order history.
- Review.
- Messaging.

### Seller

- Shop setup.
- Book creation.
- Book editing.
- Image upload.
- Inventory.
- Order processing.
- Earnings.

### Admin

- User management.
- Seller management.
- Catalog management.
- Order management.
- Payment management.
- Refunds.
- Disputes.
- Coupons.
- Platform settings.

### Technical

- Lint.
- Typecheck.
- Unit tests.
- Integration tests.
- Production build.
- Responsive checks.
- Accessibility checks.
- API error handling.
- Database integrity.

Do not claim a feature is complete unless it has been implemented and verified.

---

# 37. IMPLEMENTATION PRIORITY

Build the platform in phases.

## Phase 1 — Audit and Foundation

- Inspect existing project.
- Identify current routes and features.
- Fix broken architecture.
- Establish global design tokens.
- Configure shadcn/ui.
- Establish reusable layouts.
- Verify database connectivity.
- Verify authentication.

## Phase 2 — Public Website

- Homepage.
- Navbar and footer.
- Books listing.
- Book details.
- Categories.
- Authors.
- Publishers.
- Shops.
- Search.
- Deals.
- Information pages.

## Phase 3 — Buyer Commerce

- Buyer account.
- Addresses.
- Wishlist.
- Cart.
- Checkout.
- Payments.
- Orders.
- Reviews.
- Questions.
- Notifications.

## Phase 4 — Seller Platform

- Seller onboarding.
- Shop management.
- Book management.
- Inventory.
- Order management.
- Analytics.
- Earnings.
- Payouts.
- Messages.

## Phase 5 — Admin Platform

- Admin dashboard.
- Users.
- Sellers.
- Shops.
- Catalog.
- Orders.
- Payments.
- Refunds.
- Disputes.
- Coupons.
- Content.
- Settings.

## Phase 6 — Advanced Systems

- Real-time chat.
- Notifications.
- Q&A.
- Email.
- Shipping.
- Return/refund workflows.
- Search optimization.
- Analytics.

## Phase 7 — Production Readiness

- Security audit.
- Database integrity.
- Performance optimization.
- SEO.
- Accessibility.
- Testing.
- Production build.
- Deployment documentation.

Do not skip foundational dependencies to build advanced UI prematurely.

---

# 38. STRICT DEVELOPMENT RULES

1. Do not rebuild the project from scratch without a technical reason.
2. Do not remove existing working functionality.
3. Do not duplicate existing pages or components.
4. Do not create fake backend functionality.
5. Do not use permanent hardcoded mock data as production data.
6. Do not invent API endpoints.
7. Do not hardcode colors in components.
8. Always use global CSS design tokens.
9. Always use shadcn/ui where applicable.
10. Do not create unnecessary custom UI libraries.
11. Do not introduce unnecessary dependencies.
12. Do not place all logic inside page components.
13. Do not expose environment secrets.
14. Do not bypass backend authorization.
15. Do not trust frontend financial calculations.
16. Do not leave nonfunctional buttons.
17. Do not leave placeholder links.
18. Do not leave incomplete forms.
19. Do not use fake testimonials, ratings, sales numbers, or user statistics.
20. Do not break existing routes.
21. Do not mix Buyer, Seller, and Admin permissions.
22. Do not create unnecessary CMS functionality.
23. Keep code clean, typed, reusable, and maintainable.
24. Preserve the existing project conventions whenever possible.

---

# 39. FINAL ACCEPTANCE CRITERIA

The project will be considered complete only when:

- All required public pages work.
- Buyer authentication works.
- Seller authentication and onboarding work.
- Admin authorization works.
- Book discovery works.
- Book details work.
- Cart works.
- Checkout works.
- Configured payment methods work.
- Orders work.
- Buyer dashboard works.
- Seller dashboard works.
- Admin dashboard works.
- Inventory is accurate.
- Wishlist works.
- Reviews work.
- Q&A works.
- Chat works where configured.
- Notifications work.
- Coupons work.
- Return and refund workflows work.
- All data-driven sections use real backend data.
- All forms have validation.
- All important actions have proper feedback.
- All pages are responsive.
- Light and dark themes work.
- All colors come from global CSS tokens.
- shadcn/ui is consistently used.
- No broken links or dead buttons remain.
- No critical console errors remain.
- No critical API errors remain.
- Database relationships and constraints are valid.
- Lint and typecheck pass.
- Production build passes.
- Critical user workflows have been tested.

---

# 40. FINAL REPORT

After implementation, provide a clear development report containing:

1. Existing project architecture discovered.
2. Pages and routes implemented.
3. Components created or modified.
4. Backend APIs implemented.
5. Database models and migrations changed.
6. Authentication and authorization changes.
7. Payment integrations and their configuration status.
8. Features completed.
9. Features partially completed.
10. Features not implemented and the exact reason.
11. Security improvements.
12. Testing results.
13. Build results.
14. Required environment variables.
15. Commands to run the project.
16. Deployment requirements.

Clearly distinguish between:

- Fully implemented.
- Partially implemented.
- UI-only.
- Awaiting external credentials or provider configuration.
- Not implemented.

**FINAL INSTRUCTION:**

Build BookHand as a complete, functional, scalable bookselling marketplace.

Prioritize functionality, maintainability, security, and consistent design over merely creating attractive screens.

Inspect first. Plan second. Implement in phases. Test continuously.

Do not stop after building the homepage or public pages. Complete the Buyer, Seller, and Admin systems as well.
