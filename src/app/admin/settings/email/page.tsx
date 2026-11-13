import { prisma } from "@/lib/db";
import { AdminSettingsForm } from "@/components/admin/settings-form";

export default async function AdminEmailSettingsPage() {
  const settingsRows = await prisma.siteSetting.findMany();
  const settingsMap: Record<string, string> = {};
  for (const s of settingsRows) {
    settingsMap[s.key] = s.value;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Email & Notification Coordinates
        </h1>
        <p className="text-sm text-muted-foreground">
          Customer support contact email, hotline telephone, and administrative
          notification recipients.
        </p>
      </div>

      <AdminSettingsForm initialSettings={settingsMap} />
    </div>
  );
}
