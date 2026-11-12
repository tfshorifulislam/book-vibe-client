import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
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
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BookHand",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: SITE_CONFIG.description,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
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
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="flex min-h-screen flex-col bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
