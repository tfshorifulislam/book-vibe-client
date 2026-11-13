import { z } from "zod";

import { handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";

const bannerSchema = z.object({
  title: z.string().trim().min(2).max(100),
  subtitle: z.string().trim().max(200).optional(),
  image: z.string().trim().max(500).optional(),
  href: z.string().trim().max(300).optional(),
  isActive: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
});

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { order: "asc" },
    });
    return ok({ banners });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireApiUser("admin");
    const input = bannerSchema.parse(await readJson(request));
    const banner = await prisma.banner.create({ data: input });
    return ok({ banner }, { status: 201 });
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
    await prisma.banner.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
