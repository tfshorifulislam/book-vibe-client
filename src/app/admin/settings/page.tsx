import { prisma } from "@/lib/db";
import { AdminSettingsForm } from "@/components/admin/settings-form";


export default async function AdminSettingsPage() {
  const settingsRows = await prisma.siteSetting.findMany();
  const settingsMap: Record<string, string> = {};
  for (const s of settingsRows) {
    settingsMap[s.key] = s.value;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Platform Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure marketplace commission, delivery rates, payment gateways, and support details.
        </p>
      </div>

      <AdminSettingsForm initialSettings={settingsMap} />
    </div>
  );
}
