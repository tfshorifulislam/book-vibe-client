import { prisma } from "@/lib/db";
import { FaqManager } from "@/components/admin/faq-manager";

export default async function AdminFaqsPage() {
  const faqs = await prisma.faq.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            FAQs Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage frequently asked questions displayed on the public help
            center and FAQ page.
          </p>
        </div>
      </div>

      <FaqManager initialFaqs={faqs} />
    </div>
  );
}
