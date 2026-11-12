# TASK — BOOKHAND HERO SECTION & GLOBAL DESIGN SYSTEM

**Project:** BookHand — Book Marketplace  
**Priority:** High  
**Scope:** Home Page Hero Section + Global CSS Theme  
**Status:** To Do

---

# 1. OBJECTIVE

Implement a premium, modern, book-inspired design system for BookHand and develop the Home Page Hero Section.

The design should communicate:

- Reading and knowledge
- Trust and reliability
- Modern book marketplace
- Premium shopping experience
- Simplicity and accessibility

The design must support both Light and Dark themes.

# 2. GLOBAL CSS — `globals.css`

## Task 2.1 — Update Global Color System

Update the existing `globals.css`.

Use exactly **2 primary brand colors** throughout the application.

### Brand Color Palette

| Token     | Color     | Purpose                     |
| --------- | --------- | --------------------------- |
| Primary   | `#8B5E3C` | Warm book-inspired brown    |
| Secondary | `#D6A85F` | Golden paper / antique gold |

These two colors must be the foundation of the entire BookHand visual identity.

### Task 2.2 — Gradient System

Create gradients using only the two brand colors.

Required gradients:

- Primary gradient: Brown → Golden
- Text gradient: Brown → Golden
- Subtle background gradient: Very light brown → Very light gold
- Dark theme gradient: Deep brown → Dark golden tone

Avoid introducing additional brand colors into gradients.

### Task 2.3 — Light Theme

Use the following semantic colors:

| Variable             | Value     |
| -------------------- | --------- |
| Background           | `#FAF8F5` |
| Foreground           | `#29231F` |
| Card                 | `#FFFFFF` |
| Card Foreground      | `#29231F` |
| Primary              | `#8B5E3C` |
| Primary Foreground   | `#FFFFFF` |
| Secondary            | `#D6A85F` |
| Secondary Foreground | `#29231F` |
| Muted                | `#F0EBE5` |
| Muted Foreground     | `#756B62` |
| Border               | `#E8DFD5` |
| Input                | `#E8DFD5` |
| Ring                 | `#8B5E3C` |

### Task 2.4 — Dark Theme

Create a complete dark theme using the same two brand colors.

| Variable             | Value     |
| -------------------- | --------- |
| Background           | `#171411` |
| Foreground           | `#F5EFE7` |
| Card                 | `#211C17` |
| Card Foreground      | `#F5EFE7` |
| Primary              | `#D6A85F` |
| Primary Foreground   | `#171411` |
| Secondary            | `#8B5E3C` |
| Secondary Foreground | `#FFFFFF` |
| Muted                | `#2C251F` |
| Muted Foreground     | `#B8AA9A` |
| Border               | `#3A3028` |
| Input                | `#3A3028` |
| Ring                 | `#D6A85F` |

### Task 2.5 — Global Design Tokens

Organize the CSS variables for:

- Brand colors
- Background colors
- Foreground colors
- Border colors
- Card colors
- Input colors
- Gradient colors
- Shadows
- Border radius
- Typography

Requirements:

- Use CSS custom properties.
- Support the project's existing theme switching mechanism.
- Avoid hardcoded colors inside components when a global token exists.
- Keep all components compatible with Light and Dark themes.
- Preserve existing utility classes and third-party component compatibility.
- Ensure readable contrast in both themes.

# 3. HOME PAGE — SECTION 01: HERO SECTION

**Route:** `/`

Implement only the first section of the Home Page.

## Task 3.1 — Hero Layout

Create a premium two-column hero layout.

**Left Column: Content**

1. Eyebrow / Badge
2. Main heading
3. Supporting description
4. Search bar
5. Primary CTA
6. Secondary CTA
7. Trust indicators

**Right Column: Visual**

Create a book-focused visual composition.

Possible elements:

- Featured book covers
- Floating book cards
- Decorative book illustrations
- Subtle gradient shapes
- Small floating category badges

The right side should visually communicate an online book marketplace.

Do not use generic SaaS dashboard illustrations.

## Task 3.2 — Hero Content

### Eyebrow

`YOUR NEXT FAVORITE BOOK IS WAITING`

### Main Heading

`Discover Books.`

`Share Knowledge.`

Use the brand gradient for the second line.

### Description

`Explore thousands of books, discover new authors, and connect with independent bookstores and readers. Find your next favorite book on BookHand.`

### Search Bar

Placeholder:

`Search by book title, author, ISBN...`

Include:

- Search icon
- Search input
- Search button
- Responsive behavior

Search should navigate to the marketplace search results using the entered keyword.

### Primary CTA

`Explore Books`

Destination: `/books`

### Secondary CTA

`Start Selling`

Destination: `/register?role=seller`

### Trust Indicators

Show three concise benefits:

- Discover Amazing Books
- Shop from Independent Sellers
- Buy and Sell with Ease

Use subtle icons and supporting text.

## Task 3.3 — Hero Visual Design

Create an attractive book-themed composition.

Design direction:

- One large featured book cover
- Two or three smaller floating book cards
- Soft shadows
- Subtle rounded corners
- Warm background accents
- Brand gradient highlights
- Minimal decorative elements

Use realistic book imagery where available.

If the project already has book assets, reuse them. Otherwise, use appropriate temporary visual assets without inventing real book listings or prices.

The composition must look polished and balanced.

## Task 3.4 — Responsive Design

### Desktop

- Two-column layout
- Content on the left
- Book visual on the right
- Comfortable spacing

### Tablet

- Balanced two-column layout where space permits
- Reduce visual element sizes
- Prevent content overflow

### Mobile

- Single-column layout
- Content first
- Book visual underneath
- Full-width search bar
- Stacked or appropriately grouped CTA buttons
- Proper typography scaling
- No horizontal scrolling

# 4. VISUAL DESIGN REQUIREMENTS

The overall aesthetic should feel like a premium bookstore mixed with a modern marketplace.

Use:

- Warm neutral surfaces
- Book-inspired brown and golden accents
- Subtle gradients
- Clean typography
- Refined spacing
- Soft shadows
- Consistent border radius

Avoid:

- Excessive gradients
- Too many decorative elements
- Neon colors
- Random colors
- Oversized typography
- Generic AI-generated SaaS layouts
- Excessive whitespace
- Unnecessary animations
- Heavy blur effects

# 5. DARK / LIGHT THEME REQUIREMENTS

The Hero Section must adapt automatically to the selected theme.

Light Theme:

- Warm off-white background
- Dark readable text
- Brown primary accents
- Golden gradient highlights
- White cards

Dark Theme:

- Deep warm background
- Light readable text
- Golden primary highlights
- Brown secondary accents
- Dark cards with subtle borders

Requirements:

- No invisible text in either theme.
- No hardcoded light-theme-only colors.
- Gradients must remain readable.
- Book images must retain their original appearance.
- Theme switching must not break the layout.

# 6. TECHNICAL REQUIREMENTS

1. Inspect the existing project before making changes.
2. Follow the existing framework and folder structure.
3. Reuse existing UI components where appropriate.
4. Use the project's existing icon library.
5. Use semantic HTML.
6. Ensure accessible labels and keyboard navigation.
7. Add proper hover, focus and active states.
8. Keep components reusable and maintainable.
9. Avoid unnecessary dependencies.
10. Do not modify unrelated pages or sections.

# 7. OUT OF SCOPE

Do not implement:

- Other Home Page sections
- Browse Books page
- Book Details page
- Buyer Dashboard
- Seller Dashboard
- Admin Dashboard
- Backend APIs
- Authentication logic
- Payment integration
- Database changes

Only implement the Global CSS design system and Home Page Hero Section.

# 8. FINAL VERIFICATION CHECKLIST

- [ ] `globals.css` updated
- [ ] Exactly two primary brand colors established
- [ ] Brand gradients use only those two colors
- [ ] Light theme works correctly
- [ ] Dark theme works correctly
- [ ] Home Page Hero implemented
- [ ] Search navigation works
- [ ] Explore Books CTA works
- [ ] Start Selling CTA works
- [ ] Desktop responsive
- [ ] Tablet responsive
- [ ] Mobile responsive
- [ ] No horizontal overflow
- [ ] No console errors
- [ ] No broken images
- [ ] Existing pages remain unaffected
- [ ] Production build succeeds

# 9. COMPLETION REPORT

After implementation, provide:

1. Files created.
2. Files modified.
3. Color system details.
4. Components implemented.
5. Responsive behavior summary.
6. Light/Dark theme verification.
7. Build and lint results.
8. Any remaining issues.

**Important:** Do not proceed to the next Home Page section. Stop after completing the Hero Section and Global CSS updates.

---

**BOOKHAND — Discover Books. Share Knowledge.**
