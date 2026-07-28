"use client";

import { useEffect, useRef, useState } from "react";
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
  AdminTable,
  MetricCard,
  StatusBadge
} from "@/components/admin/admin-ui";
import { ADMIN_ORDER_REALTIME_EVENT } from "@/components/admin/order-realtime-refresh";
import { formatPrice } from "@/lib/utils";

type DashboardMetrics = {
  books: number;
  orders: number;
  revenue: number;
  pending: number;
  coupons: number;
  visitors: number;
};

type RecentOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  grand_total: number;
  status: string;
  created_at: string;
};

type OrderRealtimeDetail = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Partial<RecentOrder>;
};

export function AdminDashboardLive({
  initialMetrics,
  initialRecentOrders
}: {
  initialMetrics: DashboardMetrics;
  initialRecentOrders: RecentOrder[];
}) {
  const [metrics, setMetrics] = useState(initialMetrics);
  const [recentOrders, setRecentOrders] = useState(initialRecentOrders);
  const knownOrderIds = useRef(
    new Set(initialRecentOrders.map((order) => order.id))
  );

  useEffect(() => {
    setMetrics(initialMetrics);
    setRecentOrders(initialRecentOrders);
    knownOrderIds.current = new Set(
      initialRecentOrders.map((order) => order.id)
    );
  }, [initialMetrics, initialRecentOrders]);

  useEffect(() => {
    function handleOrderChange(event: Event) {
      const detail = (event as CustomEvent<OrderRealtimeDetail>).detail;
      if (detail.eventType !== "INSERT") return;

      const order = detail.new;
      if (
        typeof order.id !== "string" ||
        typeof order.order_number !== "string" ||
        typeof order.customer_name !== "string" ||
        typeof order.status !== "string" ||
        typeof order.created_at !== "string" ||
        typeof order.grand_total !== "number" ||
        knownOrderIds.current.has(order.id)
      ) {
        return;
      }

      knownOrderIds.current.add(order.id);
      const insertedOrder = order as RecentOrder;
      setRecentOrders((current) =>
        [insertedOrder, ...current]
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .slice(0, 8)
      );
      setMetrics((current) => ({
        ...current,
        orders: current.orders + 1,
        pending:
          current.pending + (insertedOrder.status === "pending" ? 1 : 0),
        revenue:
          current.revenue +
          (insertedOrder.status === "delivered"
            ? insertedOrder.grand_total
            : 0)
      }));
    }

    window.addEventListener(ADMIN_ORDER_REALTIME_EVENT, handleOrderChange);
    return () => {
      window.removeEventListener(ADMIN_ORDER_REALTIME_EVENT, handleOrderChange);
    };
  }, []);

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
