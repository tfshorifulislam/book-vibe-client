import type { Metadata } from "next";

import { InfoPage, InfoSection } from "@/components/marketplace/info-page";
import { prisma } from "@/lib/db";

export const metadata: Metadata = { title: "Frequently asked questions" };

export default async function FaqPage() {
  const faqs = await prisma.faq.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  return (
    <InfoPage
      eyebrow="Help centre"
      title="Frequently asked questions"
      description="Answers to the questions readers and sellers ask most often."
    >
      {faqs.map((faq) => (
        <InfoSection key={faq.id} title={faq.question}>
          <p>{faq.answer}</p>
        </InfoSection>
      ))}
    </InfoPage>
  );
}
