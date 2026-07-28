import { AdminShell } from "@/components/admin/admin-shell";
import { AdminOrderRealtimeRefresh } from "@/components/admin/order-realtime-refresh";
import { requireAdmin } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  return (
    <AdminShell user={user}>
      <AdminOrderRealtimeRefresh />
      {children}
    </AdminShell>
  );
}
