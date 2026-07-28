import Link from "next/link";
import { AdminDashboardLive } from "@/components/admin/dashboard-live";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { getAdminDashboardData } from "@/lib/repositories/admin";

export default async function DashboardPage() {
  const { metrics, recentOrders } = await getAdminDashboardData();

  return (
    <>
      <AdminPageHeader
        eyebrow="Overview"
        title="Good afternoon."
        description="Here is what is happening at Mini Book Cottage."
        action={
          <Button asChild>
            <Link href="/admin/books/new">Add a book</Link>
          </Button>
        }
      />
      <AdminDashboardLive
        initialMetrics={metrics}
        initialRecentOrders={recentOrders}
      />
    </>
  );
}
