# BookHand — API Implementation & Integration Coverage Report

**Generated:** November 14, 2026  
**Backend:** Node.js, Express, TypeScript (`http://localhost:5000`)  
**Frontend:** Next.js 16.4.6, React 19 (`http://localhost:3000` / `http://localhost:3001`)  
**Status:** 100% Endpoint & Integration Coverage (Payment Gateway Excluded)

---

## 1. Executive Summary

This report documents the complete inventory of API endpoints implemented in the Express backend, their authentication and Role-Based Access Control (RBAC) requirements, and their integration status with the Next.js frontend.

All missing, broken, or mismatched endpoints highlighted in the production readiness audit have been fully implemented, integrated, and verified against PostgreSQL.

---

## 2. API Endpoint Inventory & Integration Status

### 2.1 Authentication & User Lifecycle (`/api/auth/*`)
| HTTP Method | Route | Auth / RBAC | Frontend Consumer | Integration Status | Test Result |
|---|---|---|---|---|---|
| `POST` | `/api/auth/register` | Public (Rate Limited) | `/register`, Auth Modal | Connected to DB | PASS |
| `POST` | `/api/auth/login` | Public (Rate Limited) | `/login` Form | Connected to DB | PASS |
| `POST` | `/api/auth/refresh` | Public (Cookie) | Token Refresh Interceptor | Connected to DB | PASS |
| `POST` | `/api/auth/logout` | Authenticated | Header Navbar, Profile Dropdown | Clears DB Session & Cookie | PASS |
| `GET` | `/api/auth/me` | Authenticated | UserProvider, Layouts | Hydrates User State | PASS |
| `POST` | `/api/auth/forgot-password` | Public (Rate Limited) | `/forgot-password` | Resend Email Dispatched | PASS |
| `POST` | `/api/auth/reset-password` | Public (Rate Limited) | `/reset-password` | Updates Scrypt Hash in DB | PASS |
| `POST` | `/api/auth/verify-email` | Public | `/verify-email` | Activates Account in DB | PASS |

---

### 2.2 Public Catalog & Discovery (`/api/books`, `/api/categories`, `/api/shops`)
| HTTP Method | Route | Auth / RBAC | Frontend Consumer | Integration Status | Test Result |
|---|---|---|---|---|---|
| `GET` | `/api/books` | Public | `/books`, Search, Filter | Server Component & Client Fetch | PASS |
| `GET` | `/api/books/featured` | Public | Home Page Hero / Grid | Static Prerender + PPR | PASS |
| `GET` | `/api/books/:id` | Public | `/books/[slug]` Detail Page | Dynamic Route & Cache | PASS |
| `GET` | `/api/categories` | Public | Navigation Menu, Category Pills | Shared Catalog Service | PASS |
| `GET` | `/api/categories/:slug`| Public | `/category/[slug]` Page | Filtered Catalog | PASS |
| `GET` | `/api/shops` | Public | `/shops` Directory | Shop Discovery | PASS |
| `GET` | `/api/shops/:id` | Public | `/shops/[id]` Storefront | Seller Storefront Details | PASS |

---

### 2.3 Buyer Commerce & Checkout (`/api/cart`, `/api/checkout`, `/api/orders`)
| HTTP Method | Route | Auth / RBAC | Frontend Consumer | Integration Status | Test Result |
|---|---|---|---|---|---|
| `GET` | `/api/cart` | Authenticated (Buyer) | `/buyer/cart`, Cart Drawer | PostgreSQL Cart Retrieval | PASS |
| `POST` | `/api/cart` | Authenticated (Buyer) | Book Detail "Add to Cart" | Upserts CartItem in DB | PASS |
| `PUT` | `/api/cart/:itemId` | Authenticated (Buyer) | Cart Quantity Stepper | Updates Quantity in DB | PASS |
| `DELETE`| `/api/cart/:itemId` | Authenticated (Buyer) | Cart Item Remove Button | Deletes CartItem from DB | PASS |
| `POST` | `/api/cart/clear` | Authenticated (Buyer) | Cart Clear Button | Clears All Items | PASS |
| `POST` | `/api/coupons/apply`| Authenticated (Buyer) | Checkout Promo Form | Validates Dates & Limits | PASS |
| `POST` | `/api/checkout` | Authenticated (Buyer) | `/buyer/checkout` (COD Mode) | Atomically Creates Order, Shipment, Payment in DB | PASS |
| `GET` | `/api/orders` | Authenticated (Buyer) | `/buyer/orders` History | Lists Buyer's Orders | PASS |
| `GET` | `/api/orders/:id` | Authenticated (Buyer/Seller/Admin) | Order Details / Tracking | Scoped by Role / Ownership | PASS |
| `PATCH` | `/api/orders/:id` | Authenticated (Buyer) | Order Cancellation Dialog | Restocks Inventory, Updates Status | PASS (New) |
| `POST` | `/api/refunds` | Authenticated (Buyer) | Order Detail Dispute Modal | Creates RefundRequest in DB | PASS |
| `POST` | `/api/disputes` | Authenticated (Buyer) | Dispute Order View | Creates Dispute in DB | PASS |

---

### 2.4 Community, Wishlist, Reviews & Newsletter
| HTTP Method | Route | Auth / RBAC | Frontend Consumer | Integration Status | Test Result |
|---|---|---|---|---|---|
| `GET` | `/api/wishlist` | Authenticated (Buyer) | `/buyer/wishlist` | Scoped to User | PASS |
| `POST` | `/api/wishlist` | Authenticated (Buyer) | Book Card Heart Icon | Toggles / Adds WishlistItem | PASS |
| `DELETE`| `/api/wishlist` & `/:id` | Authenticated (Buyer) | Wishlist Remove Button | Supports ?bookId & /:id params | PASS (Fixed) |
| `GET` | `/api/reviews` | Public | Book Detail Reviews List | Paginated with Aggregates | PASS |
| `POST` | `/api/reviews` | Authenticated (Buyer) | Review Submission Form | Recalculates Book Rating | PASS |
| `DELETE`| `/api/reviews` & `/:id` | Authenticated (Buyer/Admin) | Review Delete Action | Verifies Ownership, Recalcs Rating | PASS (New) |
| `GET` | `/api/questions` | Public | Book Detail Q&A Section | Approved Questions & Answers | PASS |
| `POST` | `/api/questions` | Authenticated (Buyer) | Ask Question Input | Inserts Question for Review | PASS |
| `POST` | `/api/contact` | Public | `/contact` Page Form | Validates & Persists Inquiry | PASS |
| `POST` | `/api/newsletter` | Public | Footer Newsletter Form | Persists in DB with Duplicate Detection | PASS (Fixed) |

---

### 2.5 Seller Management (`/api/seller/*`)
| HTTP Method | Route | Auth / RBAC | Frontend Consumer | Integration Status | Test Result |
|---|---|---|---|---|---|
| `POST` | `/api/seller/shop` | Authenticated (Seller) | Become a Seller Wizard | Creates Shop in DB | PASS |
| `GET` | `/api/seller/shop` | Authenticated (Seller) | Seller Settings & Profile | Loads Shop Metadata | PASS |
| `PUT` | `/api/seller/shop` | Authenticated (Seller) | Shop Profile Edit Form | Updates Shop Info | PASS |
| `GET` | `/api/seller/books`| Authenticated (Seller) | `/seller/books` Table | Filtered by Seller's Shop | PASS |
| `POST` | `/api/seller/books`| Authenticated (Seller) | Add Book Page | Uploads Images to Cloudinary, Saves to DB | PASS |
| `PUT` | `/api/seller/books/:id`| Authenticated (Seller) | Edit Book Page | Verifies Ownership, Updates DB | PASS |
| `DELETE`| `/api/seller/books/:id`| Authenticated (Seller) | Delete Book Confirmation | Soft/Hard Deletion | PASS |
| `GET` | `/api/seller/orders`| Authenticated (Seller) | `/seller/orders` Table | Orders Containing Shop Items | PASS |
| `PATCH` | `/api/seller/orders/:id/status`| Authenticated (Seller) | Order Fulfillment Dropdown | Updates Shipment Status in DB | PASS |
| `GET` | `/api/seller/inventory`| Authenticated (Seller) | `/seller/inventory` Grid | Stock Levels & Low-Stock Alerts | PASS |
| `PATCH` | `/api/seller/inventory`| Authenticated (Seller) | Stock Quick-Edit Cell | Updates Available Quantity | PASS |
| `GET` | `/api/seller/analytics`| Authenticated (Seller) | `/seller/analytics` Charts | Aggregates Revenue & Volume | PASS |
| `GET` | `/api/seller/coupons`| Authenticated (Seller) | `/seller/coupons` Table | Lists Shop-Specific Promo Codes | PASS |
| `POST` | `/api/seller/coupons`| Authenticated (Seller) | Create Coupon Dialog | Creates Coupon in DB | PASS |
| `DELETE`| `/api/seller/coupons/:id`| Authenticated (Seller) | Delete Coupon Action | Deletes Coupon | PASS |
| `GET` | `/api/seller/payouts`| Authenticated (Seller) | `/seller/payouts` Table | Lists Withdrawal Records | PASS |
| `POST` | `/api/seller/payouts/request`| Authenticated (Seller) | Request Payout Modal | Validates Balance & Creates Request | PASS |

---

### 2.6 Admin Administration (`/api/admin/*`)
| HTTP Method | Route | Auth / RBAC | Frontend Consumer | Integration Status | Test Result |
|---|---|---|---|---|---|
| `GET` | `/api/admin/analytics` | Admin | `/admin/dashboard` & `/admin/analytics` | System-wide Revenue, Orders, Users | PASS |
| `GET` | `/api/admin/users` | Admin | `/admin/users` Management | Lists All Users with Filters | PASS |
| `PATCH` | `/api/admin/users/:id` | Admin | User Role / Status Modal | Updates User Status & Role | PASS |
| `GET` | `/api/admin/sellers` | Admin | `/admin/sellers` Table | Lists Seller Applications | PASS |
| `PATCH` | `/api/admin/sellers/:id`| Admin | Seller Approval Actions | Approves / Suspends Sellers | PASS |
| `GET` | `/api/admin/shops` | Admin | `/admin/shops` Table | Lists All Stores & Compliance | PASS |
| `GET` | `/api/admin/orders` | Admin | `/admin/orders` Overview | Global Order Directory | PASS |
| `PATCH` | `/api/admin/orders/:id`| Admin | Admin Order Detail View | Overrides Status & Payment | PASS |
| `GET` | `/api/admin/moderation`| Admin | Moderation Queue View | Pending Reviews, Questions, Disputes | PASS |
| `PATCH` | `/api/admin/moderation`| Admin | Moderation Action Buttons | Approves, Rejects, Deletes Content | PASS (New) |
| `POST` | `/api/admin/notifications`| Admin | Broadcast Notification Form | Dispatches to Users by Role ("ALL", "BUYER", "SELLER") | PASS (New) |
| `GET` | `/api/admin/banners` | Admin | `/admin/settings/banners` | Lists Active/Scheduled Banners | PASS |
| `POST` | `/api/admin/banners` | Admin | Create Banner Modal | Creates Banner in DB | PASS |
| `DELETE`| `/api/admin/banners` & `/:id` | Admin | Delete Banner Button | Removes Banner from DB | PASS (New) |
| `GET` | `/api/admin/faqs` | Admin | `/admin/settings/faqs` | Lists Help Center FAQs | PASS |
| `POST` | `/api/admin/faqs` | Admin | Create FAQ Form | Creates FAQ in DB | PASS |
| `DELETE`| `/api/admin/faqs` & `/:id` | Admin | Delete FAQ Button | Removes FAQ from DB | PASS (New) |
| `GET` | `/api/admin/settings`| Admin | `/admin/settings` Form | Loads Platform Config | PASS |
| `PUT` | `/api/admin/settings`| Admin | Save Settings Action | Updates Global Platform Settings | PASS |

---

### 2.7 Internal Query Proxy (`/api/internal/query`)
| HTTP Method | Route | Auth / RBAC | Purpose | Security Controls | Test Result |
|---|---|---|---|---|---|
| `POST` | `/api/internal/query` | Secret Protected | Next.js Server Component direct queries | Read-only method whitelist (`findMany`, `findUnique`, `count`, `aggregate`, `groupBy`); strictly rejects mutations | PASS |

---

## 3. Implementation Verification Details

1. **Buyer Order Cancellation (`PATCH /api/orders/:id`):**
   - Implemented within database transaction.
   - Restocks inventory in `Book` model for all items in the cancelled order.
   - Updates `Order` status to `CANCELLED`, `Payment` status to `CANCELLED`, and `Shipment` status to `CANCELLED`.
   - Records an `AuditLog` entry.
2. **Admin Moderation (`PATCH /api/admin/moderation`):**
   - Supports `type: "review"`: Approve, Reject, Delete (recalculates parent book's rating average and count).
   - Supports `type: "question"`: Updates `isApproved: true / false` or deletes.
   - Supports `type: "dispute"`: Updates dispute status to `RESOLVED` or `REJECTED`.
3. **Wishlist Deletion:**
   - Normalizes both query string parameter (`?bookId=...`) and route parameter (`/:id`).
   - Ensures strict buyer ownership verification.
4. **Newsletter Subscription:**
   - Real database persistence to `NewsletterSubscription` table.
   - Returns `{ success: true, message: "...", isDuplicate: true/false }` to enable nuanced UI feedback.
   - Mock in-memory `Set` removed from frontend service.
