import { z } from "zod";

import { handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";

const faqSchema = z.object({
  question: z.string().trim().min(5).max(300),
  answer: z.string().trim().min(5).max(2000),
  order: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: { order: "asc" },
    });
    return ok({ faqs });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireApiUser("admin");
    const input = faqSchema.parse(await readJson(request));
    const faq = await prisma.faq.create({ data: input });
    return ok({ faq }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireApiUser("admin");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return ok({ deleted: false });
    await prisma.faq.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
