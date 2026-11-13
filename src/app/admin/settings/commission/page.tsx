import { prisma } from "@/lib/db";
import { AdminSettingsForm } from "@/components/admin/settings-form";


export default async function AdminCommissionSettingsPage() {
  const settingsRows = await prisma.siteSetting.findMany();
  const settingsMap: Record<string, string> = {};
  for (const s of settingsRows) {
    settingsMap[s.key] = s.value;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Commission Fee Settings</h1>
        <p className="text-sm text-muted-foreground">
          Define standard percentage take-rate applied to all multi-vendor marketplace orders.
        </p>
      </div>

      <AdminSettingsForm initialSettings={settingsMap} />
    </div>
  );
}
