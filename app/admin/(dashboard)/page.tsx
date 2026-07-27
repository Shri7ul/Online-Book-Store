import Link from "next/link";
import {
  BookOpen,
  CircleDollarSign,
  Eye,
  PackageCheck,
  ShoppingBag,
  TicketPercent
} from "lucide-react";
import {
  AdminPageHeader,
  AdminTable,
  MetricCard,
  StatusBadge
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { getAdminDashboardData } from "@/lib/repositories/admin";
import { formatPrice } from "@/lib/utils";

export default async function DashboardPage() {
  const { metrics, recentOrders } = await getAdminDashboardData();
  const cards = [
    ["Total books", metrics.books, BookOpen, false],
    ["Orders", metrics.orders, ShoppingBag, false],
    ["Revenue", metrics.revenue, CircleDollarSign, true],
    ["Pending orders", metrics.pending, PackageCheck, false],
    ["Active coupons", metrics.coupons, TicketPercent, false],
    ["Visitors", metrics.visitors, Eye, false]
  ] as const;

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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value, icon, money]) => (
          <MetricCard
            key={label}
            label={label}
            value={value}
            icon={icon}
            money={money}
            tone={label === "Pending orders" ? "accent" : "default"}
          />
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            View all orders
          </Link>
        </div>
        <AdminTable>
          <thead className="border-b bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="px-5 py-4 font-semibold">Order</th>
              <th className="px-5 py-4 font-semibold">Customer</th>
              <th className="px-5 py-4 font-semibold">Total</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {recentOrders.map((order) => (
              <tr key={order.id} className="hover:bg-muted/35">
                <td className="px-5 py-4 font-bold">{order.order_number}</td>
                <td className="px-5 py-4">{order.customer_name}</td>
                <td className="px-5 py-4 font-semibold">
                  {formatPrice(order.grand_total)}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString("en-BD")}
                </td>
              </tr>
            ))}
          </tbody>
        </AdminTable>
      </div>
    </>
  );
}
