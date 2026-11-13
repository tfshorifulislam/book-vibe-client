import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SITE_CONFIG } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const defaultTitle = "BookHand — Buy & Sell Books Online";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: defaultTitle,
    template: "%s | BookHand",
  },
  description: SITE_CONFIG.description,
  keywords: [
    "books",
    "buy books",
    "sell books",
    "online bookstore",
    "book marketplace",
    "BookHand",
  ],
  authors: [{ name: "BookHand" }],
  openGraph: {
    title: defaultTitle,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: "BookHand",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: defaultTitle,
    description: SITE_CONFIG.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F5" },
    { media: "(prefers-color-scheme: dark)", color: "#171411" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={inter.variable}
    >
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
