import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        /* Primary & secondary — theme-aware brand tokens */
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        /* brand-* aliases kept for backward-compat with existing JSX */
        brand: {
          primary: {
            DEFAULT: "var(--primary)",
            hover: "var(--primary-hover)",
          },
          secondary: "var(--secondary)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        destructive: "var(--destructive)",
        "on-brand": "var(--on-brand)",
        "book-spine": "var(--book-spine)",
        star: "var(--star)",
        overlay: "var(--overlay)",
        "cover-overlay": "var(--cover-overlay)",
        footer: {
          DEFAULT: "var(--footer)",
          foreground: "var(--footer-foreground)",
          muted: "var(--footer-muted)",
          border: "var(--footer-border)",
        },
        navbar: {
          background: "var(--navbar-background)",
          foreground: "var(--navbar-foreground)",
          "muted-foreground": "var(--navbar-muted-foreground)",
          border: "var(--navbar-border)",
          "border-idle": "var(--navbar-border-idle)",
          "border-scrolled": "var(--navbar-border-scrolled)",
          hover: "var(--navbar-hover)",
          "hover-foreground": "var(--navbar-hover-foreground)",
          active: "var(--navbar-active)",
          "active-foreground": "var(--navbar-active-foreground)",
          "dropdown-background": "var(--navbar-dropdown-background)",
          "dropdown-border": "var(--navbar-dropdown-border)",
          nav: {
            foreground: "var(--navbar-nav-foreground)",
            hover: "var(--navbar-nav-hover)",
            "hover-foreground": "var(--navbar-nav-hover-foreground)",
            active: "var(--navbar-nav-active)",
            "active-foreground": "var(--navbar-nav-active-foreground)",
            "active-indicator": "var(--navbar-nav-active-indicator)",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [],
};

export default config;
