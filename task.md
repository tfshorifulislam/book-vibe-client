# Task: Improve BookHand Navbar — Light Theme

## Objective

Redesign the BookHand Navbar in Light Theme to look clean, premium, modern, and visually consistent with the book-inspired brand identity.

The current Light Theme Navbar does not look visually balanced. Improve its colors, contrast, spacing, borders, active states, and interactive elements.

## 1. Light Theme Navbar Design

### Background

- Use a clean warm-white background.
- Suggested: `var(--background)` or a dedicated navbar token.
- Avoid overly yellow, brown, or gray backgrounds.
- Navbar should visually separate from the page without looking heavy.

### Logo

- Keep the existing BookHand logo and typography.
- Use the primary brand color for the logo accent.
- Ensure the logo remains clearly visible.

### Navigation Links

- Default text: readable dark foreground.
- Hover: subtle brand-colored transition.
- Active route: use the primary brand color with a subtle background or a minimal underline indicator.
- Avoid excessive pill-shaped backgrounds.
- Maintain consistent spacing between links.

### Buttons

- Login: clean text or subtle outline button.
- Sign Up: primary brand-colored button with readable text.
- Become a Seller: secondary, understated action.
- Ensure button sizes, radius, and vertical alignment are consistent.

### Dropdown Menus

- White or card-colored background.
- Subtle border and shadow.
- Readable text with sufficient contrast.
- Clear hover and selected states.
- No dark-theme colors leaking into Light Theme.

### Borders and Shadow

- Use a subtle bottom border.
- Add a very light shadow only if necessary.
- Avoid heavy shadows and thick borders.
- If the Navbar already has a scroll-based border/shadow interaction, preserve it.

## 2. Theme Consistency

Use semantic CSS variables from `globals.css`.

Do not hardcode hex colors or arbitrary brand colors inside Navbar components.

If existing tokens are insufficient, define appropriate semantic tokens in `globals.css`, such as:

- `--navbar-background`
- `--navbar-foreground`
- `--navbar-border`
- `--navbar-hover`
- `--navbar-active`
- `--navbar-dropdown-background`

Ensure these tokens have correct values in both Light and Dark themes.

Do not break the existing Dark Theme while improving Light Theme.

## 3. Responsive Design

- Desktop: balanced horizontal navigation.
- Tablet: maintain proper spacing without overlapping.
- Mobile: clean navigation drawer with consistent theme colors.
- Theme toggle, profile menu, and dropdowns must remain visually consistent.

## 4. Implementation Rules

1. Inspect the existing Navbar component before making changes.
2. Check `globals.css`, theme provider, and Tailwind/Shadcn theme variables.
3. Identify why the current Light Theme Navbar looks incorrect.
4. Fix the actual styling issue instead of adding unnecessary overrides.
5. Reuse existing components and functionality.
6. Do not change routes, authentication logic, or navigation behavior.
7. Do not add a search bar to the Navbar.
8. Preserve existing accessibility and keyboard navigation.
9. Avoid unnecessary animations and decorative effects.

## 5. Verification Checklist

- [ ] Light Theme Navbar looks premium and balanced.
- [ ] All navigation text is readable.
- [ ] Active route is clearly distinguishable.
- [ ] Hover states look consistent.
- [ ] Dropdowns have correct Light Theme colors.
- [ ] Mobile navigation looks correct.
- [ ] Dark Theme remains unchanged visually.
- [ ] No hardcoded brand colors inside Navbar components.
- [ ] No hydration or console errors.

**Important:** Focus on the rendered Navbar appearance in Light Theme, not just the CSS variable definitions. Test the actual Navbar in both themes before completing the task.
