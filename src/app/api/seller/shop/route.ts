import { handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";
import { uniqueSlug } from "@/lib/slug";
import { shopSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireApiUser("seller");
    const shop = await prisma.shop.findUnique({
      where: { ownerId: user.id },
      include: { _count: { select: { books: true } } },
    });
    return ok({ shop });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireApiUser("seller");
    const input = shopSchema.parse(await readJson(request));
    const existing = await prisma.shop.findUnique({
      where: { ownerId: user.id },
    });

    if (!existing) {
      const slug = await uniqueSlug(input.slug, async (candidate) =>
        Boolean(await prisma.shop.findUnique({ where: { slug: candidate } })),
      );
      const shop = await prisma.shop.create({
        data: { ...input, slug, ownerId: user.id },
      });
      return ok({ shop }, { status: 201 });
    }

    if (input.slug !== existing.slug) {
      const taken = await prisma.shop.findFirst({
        where: { slug: input.slug, id: { not: existing.id } },
      });
      if (taken) {
        input.slug = await uniqueSlug(input.slug, async (candidate) =>
          Boolean(await prisma.shop.findUnique({ where: { slug: candidate } })),
        );
      }
    }

    const shop = await prisma.shop.update({
      where: { id: existing.id },
      data: input,
    });
    return ok({ shop });
  } catch (error) {
    return handleError(error);
  }
}
