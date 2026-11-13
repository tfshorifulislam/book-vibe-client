import { prisma } from "@/lib/db";
import { AdminSettingsForm } from "@/components/admin/settings-form";


export default async function AdminGeneralSettingsPage() {
  const settingsRows = await prisma.siteSetting.findMany();
  const settingsMap: Record<string, string> = {};
  for (const s of settingsRows) {
    settingsMap[s.key] = s.value;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">General Settings</h1>
        <p className="text-sm text-muted-foreground">
          Platform branding, marketplace coordinates, and core operational configurations.
        </p>
      </div>

      <AdminSettingsForm initialSettings={settingsMap} />
    </div>
  );
}
