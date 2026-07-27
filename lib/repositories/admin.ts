import "server-only";
import {
  demoBanners,
  demoBooks,
  demoCategories,
  demoSettings,
  demoWriters
} from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/repositories/catalog";
import { createClient } from "@/lib/supabase/server";

export async function getAdminDashboardData() {
  if (!isSupabaseConfigured) {
    return {
      metrics: {
        books: 40,
        orders: 128,
        revenue: 186420,
        pending: 12,
        coupons: 10,
        visitors: 4821
      },
      recentOrders: Array.from({ length: 6 }, (_, index) => ({
        id: `demo-order-${index}`,
        order_number: `MBC-DEMO-${String(index + 1).padStart(3, "0")}`,
        customer_name: [
          "Nusrat Jahan",
          "Mahin Islam",
          "Sadia Karim",
          "Fariha Ahmed",
          "Arif Hasan",
          "Tamanna Noor"
        ][index],
        grand_total: 720 + index * 180,
        status: ["pending", "confirmed", "packed", "shipped", "delivered"][
          index % 5
        ],
        created_at: new Date(Date.now() - index * 86400000).toISOString()
      }))
    };
  }

  const supabase = await createClient();
  const [
    books,
    orders,
    pending,
    coupons,
    revenue,
    visitors,
    recentOrders
  ] = await Promise.all([
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("coupons")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase.from("orders").select("grand_total").eq("status", "delivered"),
    supabase
      .from("analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_name", "page_view"),
    supabase
      .from("orders")
      .select("id,order_number,customer_name,grand_total,status,created_at")
      .order("created_at", { ascending: false })
      .limit(8)
  ]);
  const queryError = [
    books.error,
    orders.error,
    pending.error,
    coupons.error,
    revenue.error,
    visitors.error,
    recentOrders.error
  ].find(Boolean);
  if (queryError) throw queryError;

  return {
    metrics: {
      books: books.count ?? 0,
      orders: orders.count ?? 0,
      pending: pending.count ?? 0,
      coupons: coupons.count ?? 0,
      revenue: (revenue.data ?? []).reduce(
        (total, item) => total + Number(item.grand_total),
        0
      ),
      visitors: visitors.count ?? 0
    },
    recentOrders: recentOrders.data ?? []
  };
}

export async function getAdminBooks() {
  if (!isSupabaseConfigured) return demoBooks;
  const { data, error } = await (await createClient())
    .from("books")
    .select("*,writer:writers(id,name),category:categories(id,name)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function getAdminBook(id: string) {
  if (!isSupabaseConfigured)
    return demoBooks.find((book) => book.id === id) ?? null;
  const { data, error } = await (await createClient())
    .from("books")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAdminCategories() {
  if (!isSupabaseConfigured) return demoCategories;
  const { data, error } = await (await createClient())
    .from("categories")
    .select("*,books(count)")
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getAdminWriters() {
  if (!isSupabaseConfigured) return demoWriters;
  const { data, error } = await (await createClient())
    .from("writers")
    .select("*,books(count)")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getAdminBanners() {
  if (!isSupabaseConfigured) return demoBanners;
  const { data, error } = await (await createClient())
    .from("hero_banners")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getAdminCoupons() {
  if (!isSupabaseConfigured)
    return [
      {
        id: "demo-1",
        code: "LEON10",
        discount_type: "fixed",
        discount_value: 100,
        minimum_purchase: 500,
        usage_count: 18,
        max_usage: 500,
        expires_at: "2027-12-31T17:59:59Z",
        is_active: true
      },
      {
        id: "demo-2",
        code: "READ15",
        discount_type: "percentage",
        discount_value: 15,
        minimum_purchase: 800,
        usage_count: 7,
        max_usage: 300,
        expires_at: "2027-12-31T17:59:59Z",
        is_active: true
      }
    ];
  const { data, error } = await (await createClient())
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAdminOrders() {
  if (!isSupabaseConfigured)
    return (await getAdminDashboardData()).recentOrders.map((order, index) => ({
      ...order,
      phone: `0170000000${index + 1}`,
      email: `reader${index + 1}@example.com`,
      delivery_zone: index % 2 ? "outside_dhaka" : "inside_dhaka",
      payment_method: "cash_on_delivery",
      transaction_id: `DEMO-TXN-${index + 1}`,
      order_items: [{ quantity: 1, book_name: demoBooks[index].name }]
    }));
  const { data, error } = await (await createClient())
    .from("orders")
    .select("*,order_items(id,book_name,quantity,unit_price,line_total)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function getAdminUsers() {
  if (!isSupabaseConfigured)
    return Array.from({ length: 8 }, (_, index) => ({
      id: `demo-user-${index}`,
      full_name: [
        "Nusrat Jahan",
        "Mahin Islam",
        "Sadia Karim",
        "Fariha Ahmed",
        "Arif Hasan",
        "Tamanna Noor",
        "Saif Rahman",
        "Rumana Akter"
      ][index],
      phone: `0170000000${index + 1}`,
      preferred_language: "en",
      created_at: new Date(Date.now() - index * 86400000 * 4).toISOString()
    }));
  const { data, error } = await (await createClient())
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function getAdminSettings() {
  if (!isSupabaseConfigured) return demoSettings;
  const { data, error } = await (await createClient())
    .from("settings")
    .select("*")
    .eq("id", true)
    .single();
  if (error) throw error;
  return data ?? demoSettings;
}
