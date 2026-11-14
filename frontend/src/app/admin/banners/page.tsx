import { prisma } from "@/lib/db";
import { BannerManager } from "@/components/admin/banner-manager";

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Banners Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure homepage promotional banners, hero callouts, and seasonal
            campaigns.
          </p>
        </div>
      </div>

      <BannerManager initialBanners={banners} />
    </div>
  );
}
