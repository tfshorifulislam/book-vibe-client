import { z } from "zod";

import { fail, handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";

const updateSchema = z.object({
  status: z.enum(["NEW", "READ", "REPLIED"]),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireApiUser("admin");
    const { id } = await params;
    const input = updateSchema.parse(await readJson(request));

    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) return fail("Contact message not found.", 404);

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status: input.status },
    });

    return ok({ message: updated });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireApiUser("admin");
    const { id } = await params;

    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) return fail("Contact message not found.", 404);

    await prisma.contactMessage.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
