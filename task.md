# TASK — FIX GLOBAL LIGHT & DARK THEME COLORS

**Project:** BookHand  
**Priority:** Critical  
**Scope:** Global CSS + Theme Consistency

## 1. PROBLEM

The current Light Theme has visual inconsistencies:

- Text colors are not displaying correctly.
- Some text becomes difficult to read against backgrounds.
- Background colors do not update consistently.
- Some cards retain incorrect background colors.
- Input fields and borders do not follow the active theme.
- Some components appear to use Dark Theme colors even in Light Theme.
- Gradient text and background colors sometimes become unreadable.

Fix the root cause instead of applying random CSS overrides.

## 2. FIRST — AUDIT EXISTING IMPLEMENTATION

Before changing anything, inspect:

- `globals.css`
- Theme provider
- Theme switching mechanism
- Tailwind CSS theme configuration
- Shadcn UI CSS variables
- Component-level hardcoded colors
- Background and text utility classes

Identify why the Light Theme is inconsistent.

Do not assume the theme uses `.dark`. Verify the actual implementation.

## 3. ESTABLISH A SINGLE COLOR SYSTEM

Use only two primary brand colors:

| Brand        | Hex       |
| ------------ | --------- |
| Book Brown   | `#8B5E3C` |
| Antique Gold | `#D6A85F` |

Other neutral colors are allowed for backgrounds, text, borders and surfaces. The two-color restriction applies to brand colors, not the entire UI.

### Light Theme

```css
:root {
  color-scheme: light;

  --background: #faf8f5;
  --foreground: #29231f;

  --card: #ffffff;
  --card-foreground: #29231f;

  --popover: #ffffff;
  --popover-foreground: #29231f;

  --primary: #8b5e3c;
  --primary-foreground: #ffffff;

  --secondary: #d6a85f;
  --secondary-foreground: #29231f;

  --muted: #f0ebe5;
  --muted-foreground: #756b62;

  --accent: #f3e8d8;
  --accent-foreground: #65452f;

  --border: #e8dfd5;
  --input: #e8dfd5;
  --ring: #8b5e3c;

  --destructive: #dc2626;
}
```

### Dark Theme

```css
.dark {
  color-scheme: dark;

  --background: #171411;
  --foreground: #f5efe7;

  --card: #211c17;
  --card-foreground: #f5efe7;

  --popover: #211c17;
  --popover-foreground: #f5efe7;

  --primary: #d6a85f;
  --primary-foreground: #171411;

  --secondary: #8b5e3c;
  --secondary-foreground: #ffffff;

  --muted: #2c251f;
  --muted-foreground: #b8aa9a;

  --accent: #35291f;
  --accent-foreground: #f5efe7;

  --border: #3a3028;
  --input: #3a3028;
  --ring: #d6a85f;

  --destructive: #f87171;
}
```

Adapt the variable format to the existing Tailwind and Shadcn UI configuration. Do not blindly replace existing tokens if the project uses a different naming convention.

## 4. FIX GLOBAL BACKGROUND AND TEXT

Ensure the application root uses semantic theme variables.

```css
html {
  color-scheme: light;
}

html.dark {
  color-scheme: dark;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  transition:
    background-color 200ms ease,
    color 200ms ease;
}
```

Requirements:

- Every page must inherit the correct background.
- Every page must inherit the correct foreground color.
- Main content must not retain outdated background colors.
- No unexpected white backgrounds in Dark Theme.
- No unexpected dark backgrounds in Light Theme.
- Avoid conflicting global selectors.

## 5. FIX COMPONENT COLORS

Audit and correct these components:

### Typography

- Headings
- Paragraphs
- Labels
- Captions
- Muted text
- Links

### Surfaces

- Main page background
- Section background
- Cards
- Popovers
- Dropdown menus
- Dialogs
- Sidebars

### Form Elements

- Input
- Textarea
- Select
- Checkbox
- Radio
- Search bar
- Placeholder text

### Interactive Elements

- Primary buttons
- Secondary buttons
- Ghost buttons
- Links
- Tabs
- Badges
- Hover states
- Focus states
- Disabled states

All components must use the semantic color tokens.

## 6. FIX GRADIENTS

Create reusable gradient utilities using only Book Brown and Antique Gold.

```css
.brand-gradient {
  background-image: linear-gradient(135deg, #8b5e3c, #d6a85f);
}

.brand-gradient-text {
  background-image: linear-gradient(135deg, #8b5e3c, #d6a85f);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
```

Important:

- Verify gradient text in both themes.
- Ensure gradient text never disappears.
- Use an appropriate solid-color fallback.
- Do not use low-contrast gradients for small text.

## 7. REMOVE COLOR CONFLICTS

Search the codebase for hardcoded colors such as:

- `bg-white`
- `bg-black`
- `text-black`
- `text-white`
- `text-gray-*`
- `bg-gray-*`
- `border-gray-*`
- Hardcoded hexadecimal colors

Do not blindly replace all occurrences.

Replace theme-dependent colors with semantic tokens. Preserve intentional image, illustration and status colors.

Use:

- `bg-background`
- `text-foreground`
- `bg-card`
- `text-card-foreground`
- `text-muted-foreground`
- `border-border`
- `bg-primary`
- `text-primary-foreground`

Follow the project's actual Tailwind configuration.

## 8. HOME PAGE HERO SECTION

Verify the existing Hero Section after fixing global colors.

Light Theme:

- Warm off-white background.
- Dark readable headings.
- Brown primary CTA.
- Brown-to-gold gradient heading.
- White book cards.
- Visible borders and shadows.

Dark Theme:

- Deep warm background.
- Light headings.
- Golden highlights.
- Dark book cards.
- Visible borders and shadows.

Ensure the Hero Section does not contain hardcoded theme-specific background colors that conflict with global CSS.

## 9. THEME SWITCHING

Test the complete application in both themes.

Requirements:

- Theme switching updates all semantic colors.
- No mixed-theme components.
- No flash of incorrect background during initial load, where supported by the existing theme provider.
- Preserve the user's existing theme preference mechanism.
- No hydration mismatch.
- No unnecessary theme provider or dependency replacement.

## 10. VERIFICATION

Test the following:

| Element         | Light    | Dark     |
| --------------- | -------- | -------- |
| Body background | Correct  | Correct  |
| Main heading    | Readable | Readable |
| Paragraph       | Readable | Readable |
| Card background | Correct  | Correct  |
| Card text       | Readable | Readable |
| Search input    | Correct  | Correct  |
| Placeholder     | Visible  | Visible  |
| Buttons         | Correct  | Correct  |
| Borders         | Visible  | Visible  |
| Dropdown        | Correct  | Correct  |
| Gradient text   | Visible  | Visible  |
| Hero background | Correct  | Correct  |

Also verify:

- [ ] No conflicting CSS variables.
- [ ] No unexpected hardcoded backgrounds.
- [ ] No invisible text.
- [ ] No broken Shadcn UI components.
- [ ] No console errors.
- [ ] No hydration errors.
- [ ] Production build succeeds.

## 11. IMPORTANT RULES

1. Fix the root cause, not individual symptoms.
2. Do not redesign the entire website.
3. Do not modify unrelated functionality.
4. Do not introduce additional brand colors.
5. Do not remove existing functionality.
6. Keep all theme colors centralized in `globals.css`.
7. Preserve the existing theme switching architecture.
8. Test actual rendered components, not just CSS variable definitions.

## 12. COMPLETION REPORT

Provide:

- Root cause of the theme inconsistency.
- Files modified.
- CSS variables corrected.
- Components fixed.
- Light Theme verification.
- Dark Theme verification.
- Build result.
- Remaining issues.

**Final Goal:** BookHand must have a visually consistent, readable and polished Light Theme and Dark Theme across all existing pages and components.
