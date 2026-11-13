# Task: Implement Books Listing Page (`/books`)

## 1. Objective

Implement a complete, modern, responsive Books Listing Page for the BookHand application at:

`http://localhost:3000/books`

Before making changes, carefully inspect the existing frontend project, its architecture, design system, components, routing, API integration, and global CSS.

Follow the existing project conventions. Do not rebuild unrelated parts of the application.

## 2. Design Direction

Create a premium online bookstore experience.

Design requirements:

- Clean, modern, minimal, and professional UI.
- Primarily white/light theme with balanced contrast.
- Support the existing dark theme if the application already provides one.
- Consistent spacing, typography, borders, shadows, and rounded corners.
- Avoid excessive gradients, unnecessary decorations, and oversized cards.
- Use book cover images with consistent aspect ratios.
- Maintain a visually balanced layout.
- Use subtle hover effects and transitions.

## 3. Global Design System

This is a strict requirement.

- Read the existing `globals.css` before writing UI styles.
- Use existing global CSS variables and design tokens for ALL colors.
- Use existing typography tokens and font-size utilities.
- Never hardcode HEX, RGB, or arbitrary colors inside components.
- Do not introduce a separate color system.
- If a required design token is missing, define it centrally in `globals.css`.
- Keep styles consistent across the entire page.

## 4. Page Structure

### A. Existing Navbar

- Reuse the existing shared Navbar.
- Do not create another Navbar.
- Do not add a search bar to the Navbar.
- Preserve existing navigation links and interactions.

### B. Page Header

Create a visually appealing page introduction.

Content:

- Breadcrumb: Home / Books
- Heading: Explore Books
- Description: Discover your next favorite book from our collection.
- Show the total number of available books dynamically.

### C. Search and Filter Toolbar

Create a separate search and filtering section below the page header.

Include:

- Book search input.
- Category filter.
- Author filter.
- Price range filter.
- Availability filter (if supported by existing data).
- Sort dropdown.

Sorting options:

- Featured
- Newest
- Price: Low to High
- Price: High to Low
- Title: A–Z

Requirements:

- All filters must work.
- Search should filter by book title and author.
- Multiple filters should work together.
- Include a Clear All Filters action.
- Show active filter states.
- Debounce search input if appropriate.
- Do not create fake API endpoints.

### D. Category Navigation

Display available book categories in a clean horizontal navigation or responsive grid.

Requirements:

- Load categories from existing data/API where available.
- Allow users to select a category.
- Clearly indicate the active category.
- Include an All Books option.
- Make the section responsive.
- Use horizontal scrolling on smaller screens when appropriate.

### E. Books Listing Grid

Create a responsive book listing grid.

Desktop:

- 4 or 5 columns depending on available width.

Tablet:

- 2 or 3 columns.

Mobile:

- 2 columns where practical, otherwise 1 column for very narrow screens.

Each book card should include:

1. Book cover image.
2. Book title.
3. Author name.
4. Category.
5. Current price.
6. Original price and discount, only when actual data supports it.
7. Rating and review count, only when available.
8. Availability status, when supported.
9. View Details action.
10. Add to Cart action, only if the existing application supports cart functionality.

Card interactions:

- Subtle image hover effect.
- Consistent card height.
- Proper image loading and fallback states.
- Clear button interaction feedback.
- Avoid unnecessary information overload.

Do not invent book prices, ratings, reviews, discounts, or availability information.

### F. Pagination

Implement functional pagination.

Requirements:

- Previous and Next controls.
- Page number navigation.
- Current page indicator.
- Dynamic total pages.
- Update the displayed books when changing pages.
- Reset to page 1 when filters or search change.
- Disable navigation when appropriate.

If the existing backend supports pagination, use it instead of implementing duplicate client-side pagination.

### G. Empty State

When no books match the current search or filters, show a proper empty state.

Include:

- Clear message: No books found.
- Short supporting description.
- Clear Filters action.
- Appropriate visual treatment.

### H. Loading and Error States

Implement:

- Loading skeletons for book cards.
- Error state with a retry action.
- Empty state when the API returns no books.
- Image fallback when a cover image fails to load.

Do not show fake loading animations when data is already available.

### I. Footer

Reuse the existing shared Footer.

Do not create a duplicate footer.

## 5. Dynamic Functionality

The page should not be a static UI mockup.

Make the following features functional:

- Book search.
- Category filtering.
- Author filtering.
- Price filtering.
- Availability filtering, if supported.
- Sorting.
- Pagination.
- Clear filters.
- Book details navigation.
- Add to Cart, if existing functionality supports it.

Use the existing API client, services, hooks, and backend endpoints.

Before implementing data fetching:

1. Inspect existing API endpoints.
2. Inspect book and category data models.
3. Inspect existing frontend services.
4. Reuse existing API integration.
5. Handle loading, success, empty, and error states.

If backend functionality is unavailable, keep the page architecture ready for integration. Do not invent endpoints or pretend API requests are working.

## 6. Component Architecture

Keep the code organized and beginner-friendly.

Create a `books` folder inside the existing components directory.

Suggested structure (adapt it to the actual project architecture):

```text
components/
└── books/
    ├── books-page.tsx
    ├── books-header.tsx
    ├── books-toolbar.tsx
    ├── books-search.tsx
    ├── books-filters.tsx
    ├── books-categories.tsx
    ├── books-grid.tsx
    ├── book-card.tsx
    ├── books-pagination.tsx
    ├── books-empty-state.tsx
    └── books-loading.tsx
```

These are suggested component boundaries, not a requirement to create every file.

Rules:

- Keep the `/books` route page lightweight.
- Put books page components inside the `books` folder.
- Reuse shared components.
- Avoid giant components.
- Avoid unnecessary abstractions.
- Keep data fetching and UI responsibilities organized.
- Follow the project's existing naming conventions.

## 7. UI Components

Use the existing shadcn/ui components wherever available.

Preferred components:

- Input
- Button
- Select
- Checkbox
- Slider
- Badge
- Skeleton
- Card
- Dropdown Menu
- Breadcrumb

Do not install another UI library.

## 8. Responsive Requirements

Test the complete page at:

- Mobile: 320px–767px
- Tablet: 768px–1023px
- Laptop: 1024px–1439px
- Desktop: 1440px and above

Ensure:

- No horizontal overflow.
- No overlapping elements.
- Book covers maintain proper aspect ratios.
- Filters remain usable on mobile.
- Toolbar adapts to smaller screens.
- Buttons and inputs have touch-friendly dimensions.
- Typography remains readable.

## 9. Accessibility

- Use semantic HTML.
- Add accessible labels to all inputs.
- Provide meaningful alt text for book covers.
- Maintain keyboard accessibility.
- Include visible focus states.
- Ensure sufficient contrast.
- Use appropriate button types and ARIA attributes when needed.

## 10. Performance

- Use the existing image optimization solution.
- Avoid unnecessary client-side rendering.
- Avoid unnecessary API requests.
- Use debounced search where appropriate.
- Prevent unnecessary component re-renders.
- Keep dependencies minimal.

## 11. Strict Restrictions

- Do not modify unrelated pages.
- Do not create a new Navbar or Footer.
- Do not add a Navbar search bar.
- Do not hardcode colors in components.
- Do not hardcode fake book data in production.
- Do not invent API endpoints.
- Do not introduce another UI library.
- Do not duplicate existing components.
- Do not break existing routes.
- Do not change the existing global theme unnecessarily.

## 12. Final Verification

After implementation:

1. Verify `/books` loads successfully.
2. Verify all existing shared components work correctly.
3. Verify search functionality.
4. Verify all available filters.
5. Verify sorting.
6. Verify pagination.
7. Verify empty, loading, and error states.
8. Verify mobile, tablet, and desktop layouts.
9. Verify global CSS color and typography usage.
10. Run available lint and TypeScript checks.
11. Run the production build if practical.
12. Fix any errors introduced by this implementation.

## Expected Result

A complete, production-quality BookHand Books Listing Page with a premium bookstore design, functional search and filtering, dynamic book listing, responsive layouts, and clean component architecture.

**Implement the actual page and its functionality. Do not stop after creating a visual mockup or documentation.**
