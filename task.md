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

# Task: Full Codebase Cleanup & Theme Color Bug Fix

## Part 1: Full Project Cleanup

Audit the entire Code Editor project, including frontend and backend.

### Identify unnecessary files and folders

Find and remove files/folders that are:

- Unused components and pages.
- Duplicate components, utilities, or configurations.
- Old implementations and abandoned code.
- Unused hooks, contexts, and providers.
- Unused assets, images, icons, and stylesheets.
- Temporary testing and debugging files.
- Empty folders.
- Unused mock data and obsolete demo implementations.
- Dead code and outdated modules.

### Safety Rules

- Do not delete files just because they appear unnecessary.
- Check all imports, references, routes, scripts, and dependencies before deleting anything.
- Preserve essential configuration files, environment examples, package files, migrations, and documentation.
- Do not remove functionality currently used by the application.
- Do not delete user data or database-related files.
- Remove unused dependencies from `package.json` only after verifying they are genuinely unused.
- Keep the existing project architecture and naming conventions.

After cleanup, verify that there are no broken imports or missing modules.

## Part 2: Fix the Unexpected Theme Color

### Current Bug

The application supports only two themes:

1. Light Theme
2. Dark Theme

However, when navigating back from the Not Found (404) page, an unexpected third color appears in the UI.

This color is not part of either theme and should never appear.

### Investigate the Root Cause

Inspect:

- `globals.css`
- Theme provider and theme context.
- Tailwind/Shadcn CSS variables.
- Root layout and application wrappers.
- Not Found page (`not-found.tsx`).
- Theme toggle implementation.
- Browser history and back navigation behavior.
- Loading, transition, and fallback backgrounds.
- Any hardcoded colors or outdated CSS classes.
- Component-level background and text styles.

Check whether the issue is caused by:

- Hardcoded background colors.
- Incorrect CSS variable fallback values.
- Theme hydration mismatch.
- Theme state not being restored correctly.
- Browser back-forward cache (bfcache).
- Incorrect transition or loading styles.
- Not Found page using a different theme configuration.

### Expected Behavior

- Only Light and Dark themes must exist.
- Returning from the 404 page must preserve the selected theme.
- No unexpected background or text color should flash during navigation.
- The page background, navbar, sidebar, editor, panels, terminal, and other UI elements must use the correct theme tokens.
- Theme switching must work consistently across all routes.
- Direct page refresh must preserve the selected theme.
- Browser Back and Forward navigation must not introduce another color.
- No hydration mismatch or theme flickering.

## Part 3: Global Theme Consistency

Use `globals.css` as the single source of truth for theme colors.

- Remove obsolete color variables.
- Remove unused theme classes.
- Use semantic CSS variables for backgrounds, foregrounds, borders, cards, panels, muted states, and interactive elements.
- Avoid hardcoded hex colors inside components.
- Do not introduce a third theme or additional brand color.
- Preserve intentional syntax highlighting colors in the code editor.

## Part 4: Testing

Test the following scenarios:

1. Open the application in Light Theme.
2. Navigate to the 404 page.
3. Press browser Back.
4. Navigate to the 404 page again.
5. Press browser Forward and Back.
6. Refresh the application.
7. Switch to Dark Theme and repeat the same steps.
8. Navigate between multiple routes.
9. Check all major UI areas for unexpected colors.

Also run:

- TypeScript checks.
- ESLint.
- Production build.
- Broken import/reference checks.

## Final Requirements

- Remove only verified unused files and folders.
- Fix the actual root cause of the unexpected theme color.
- Do not redesign the entire application.
- Do not change existing features or business logic.
- Do not introduce new themes or colors.
- Preserve the existing UI design and functionality.

At completion, provide:

1. List of deleted files and folders.
2. List of modified files.
3. Root cause of the unexpected theme color.
4. Explanation of the fix.
5. TypeScript, lint, and build results.
6. Any remaining issues.

**Priority: Correctness and stability over aggressive file deletion.**
