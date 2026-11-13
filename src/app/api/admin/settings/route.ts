import { z } from "zod";

import { handleError, ok, readJson, requireApiUser } from "@/lib/api";
import { prisma } from "@/lib/db";

const schema = z.record(z.string(), z.string());

export async function GET() {
  try {
    await requireApiUser("admin");
    const settings = await prisma.siteSetting.findMany({
      orderBy: { key: "asc" },
    });
    return ok({ settings });
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireApiUser("admin");
    const input = schema.parse(await readJson(request));
    await prisma.$transaction(
      Object.entries(input).map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        }),
      ),
    );
    await prisma.auditLog.create({
      data: {
        userId: admin.id,
        action: "SETTINGS_UPDATED",
        entity: "SiteSetting",
        metadata: JSON.stringify(Object.keys(input)),
      },
    });
    return ok({ updated: true });
  } catch (error) {
    return handleError(error);
  }
}
