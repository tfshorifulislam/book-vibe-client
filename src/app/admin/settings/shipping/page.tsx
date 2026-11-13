import { prisma } from "@/lib/db";
import { AdminSettingsForm } from "@/components/admin/settings-form";


export default async function AdminShippingSettingsPage() {
  const settingsRows = await prisma.siteSetting.findMany();
  const settingsMap: Record<string, string> = {};
  for (const s of settingsRows) {
    settingsMap[s.key] = s.value;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Shipping & Delivery Rates</h1>
        <p className="text-sm text-muted-foreground">
          Configure baseline courier delivery rates for Inside Dhaka and Outside Dhaka.
        </p>
      </div>

      <AdminSettingsForm initialSettings={settingsMap} />
    </div>
  );
}
