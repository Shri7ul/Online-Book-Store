import {
  AdminPageHeader,
  AdminTable,
  StatusBadge
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { updateOrderStatusAction } from "@/lib/actions/admin";
import { getAdminOrders } from "@/lib/repositories/admin";
import { formatPrice } from "@/lib/utils";

const statuses = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "returned"
];

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();
  return (
    <>
      <AdminPageHeader
        eyebrow="Operations"
        title="Orders"
        description="Confirm, pack, ship, deliver, cancel, or return orders. Stock changes transactionally."
      />
      <AdminTable>
        <thead className="border-b bg-muted/60 text-xs text-muted-foreground">
          <tr>
            <th className="px-5 py-4 font-semibold">Order</th>
            <th className="px-5 py-4 font-semibold">Customer</th>
            <th className="px-5 py-4 font-semibold">Items</th>
            <th className="px-5 py-4 font-semibold">Payment</th>
            <th className="px-5 py-4 font-semibold">Total</th>
            <th className="px-5 py-4 font-semibold">Status</th>
            <th className="px-5 py-4 font-semibold">Update</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {orders.map((order) => (
            <tr key={order.id} className="align-top hover:bg-muted/35">
              <td className="px-5 py-4">
                <p className="font-bold">{order.order_number}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString("en-BD")}
                </p>
              </td>
              <td className="px-5 py-4">
                <p className="font-semibold">{order.customer_name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{order.phone}</p>
                <p className="text-xs text-muted-foreground">{order.email}</p>
              </td>
              <td className="max-w-56 px-5 py-4">
                {(order.order_items ?? []).map(
                  (item: { book_name: string; quantity: number }) => (
                    <p key={item.book_name} className="line-clamp-2 text-xs">
                      {item.book_name} × {item.quantity}
                    </p>
                  )
                )}
              </td>
              <td className="px-5 py-4">
                <p className="text-xs font-semibold">
                  {order.payment_method.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {order.transaction_id || "No transaction"}
                </p>
              </td>
              <td className="px-5 py-4 font-semibold">
                {formatPrice(order.grand_total)}
              </td>
              <td className="px-5 py-4">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-5 py-4">
                <form action={updateOrderStatusAction} className="flex gap-2">
                  <input type="hidden" name="order_id" value={order.id} />
                  <select
                    name="status"
                    defaultValue={order.status}
                    className="h-9 rounded-lg border bg-background px-2 text-xs"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status[0].toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                  <Button type="submit" size="sm" variant="outline">
                    Save
                  </Button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </AdminTable>
    </>
  );
}
