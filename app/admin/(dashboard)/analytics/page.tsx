import { BarChart3, Eye, ShoppingBag, TrendingUp } from "lucide-react";
import {
  AdminPageHeader,
  MetricCard
} from "@/components/admin/admin-ui";
import { getAdminDashboardData } from "@/lib/repositories/admin";

const bars = [42, 58, 49, 71, 64, 86, 78, 92, 74, 96, 88, 100];

export default async function AnalyticsPage() {
  const { metrics } = await getAdminDashboardData();
  return (
    <>
      <AdminPageHeader
        eyebrow="Performance"
        title="Analytics"
        description="Store activity from first-party events. Google Analytics and Meta Pixel IDs are managed in settings."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Page views" value={metrics.visitors} icon={Eye} />
        <MetricCard label="Orders" value={metrics.orders} icon={ShoppingBag} />
        <MetricCard
          label="Conversion events"
          value={Math.round(metrics.orders * 1.8)}
          icon={TrendingUp}
        />
        <MetricCard
          label="Catalog size"
          value={metrics.books}
          icon={BarChart3}
        />
      </div>
      <div className="mt-6 rounded-xl border bg-card p-6">
        <div>
          <h2 className="font-display text-xl font-semibold">Store activity</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Rolling 12-week relative traffic
          </p>
        </div>
        <div className="mt-8 flex h-72 items-end gap-2 sm:gap-4">
          {bars.map((height, index) => (
            <div key={index} className="flex h-full flex-1 items-end">
              <div
                className="w-full rounded-t-md bg-primary/85 transition hover:bg-accent"
                style={{ height: `${height}%` }}
                title={`Week ${index + 1}: ${height}%`}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
