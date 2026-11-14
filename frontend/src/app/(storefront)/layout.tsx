import type { ReactNode } from "react";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { getCategories } from "@/lib/services/catalog";

export default async function StorefrontLayout({
  children,
}: {
  children: ReactNode;
}) {
  const categories = await getCategories();

  return (
    <>
      <Navbar categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
