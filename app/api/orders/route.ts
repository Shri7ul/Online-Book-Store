import { NextResponse } from "next/server";
import { z } from "zod";
import { demoBooks, demoSettings } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/repositories/catalog";
import { enforceSameOrigin, rateLimit } from "@/lib/server/security";
import { createAdminClient } from "@/lib/supabase/admin";

const orderSchema = z.object({
  customer_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^(?:\+?88)?01[3-9]\d{8}$/),
  email: z.string().email().max(180),
  district: z.string().trim().min(2).max(80),
  area: z.string().trim().min(2).max(120),
  address: z.string().trim().min(8).max(500),
  notes: z.string().trim().max(1000).optional().nullable(),
  delivery_zone: z.enum(["inside_dhaka", "outside_dhaka"]),
  payment_method: z.enum(["cash_on_delivery", "online"]),
  transaction_id: z.string().trim().max(100).optional().nullable(),
  coupon_code: z.string().trim().max(30).optional().nullable(),
  items: z
    .array(
      z.object({
        book_id: z.string().min(1),
        quantity: z.number().int().min(1).max(20)
      })
    )
    .min(1)
    .max(50)
});

export async function POST(request: Request) {
  try {
    await enforceSameOrigin();
    await rateLimit("order", 6, 10 * 60_000);
    const input = orderSchema.parse(await request.json());
    if (input.payment_method === "cash_on_delivery" && !input.transaction_id) {
      throw new Error("Transaction ID is required for cash on delivery.");
    }

    const orderNumber = `MBC-${Date.now().toString(36).toUpperCase()}`;

    if (!isSupabaseConfigured) {
      for (const item of input.items) {
        const book = demoBooks.find((entry) => entry.id === item.book_id);
        if (!book || book.stock < item.quantity)
          throw new Error("One or more books are no longer available.");
      }
      return NextResponse.json({ order_number: orderNumber }, { status: 201 });
    }

    const supabase = createAdminClient();
    const bookIds = [...new Set(input.items.map((item) => item.book_id))];
    const { data: books, error: bookError } = await supabase
      .from("books")
      .select("id,name,regular_price,discount_price,stock,is_active")
      .in("id", bookIds)
      .eq("is_active", true);
    if (bookError || !books || books.length !== bookIds.length)
      throw new Error("One or more books are no longer available.");

    let subtotal = 0;
    const orderItems = input.items.map((item) => {
      const book = books.find((entry) => entry.id === item.book_id)!;
      if (book.stock < item.quantity)
        throw new Error(`${book.name} has insufficient stock.`);
      const unitPrice = Number(book.discount_price ?? book.regular_price);
      subtotal += unitPrice * item.quantity;
      return {
        book_id: book.id,
        book_name: book.name,
        quantity: item.quantity,
        unit_price: unitPrice,
        line_total: unitPrice * item.quantity
      };
    });

    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("delivery_inside_dhaka,delivery_outside_dhaka")
      .eq("id", true)
      .single();
    if (settingsError) throw new Error("Store settings are unavailable.");
    const deliveryCharge =
      input.delivery_zone === "inside_dhaka"
        ? Number(settings.delivery_inside_dhaka)
        : Number(settings.delivery_outside_dhaka);

    let couponId: string | null = null;
    let discount = 0;
    if (input.coupon_code) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", input.coupon_code.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();
      if (
        coupon &&
        (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) &&
        subtotal >= Number(coupon.minimum_purchase) &&
        (!coupon.max_usage || coupon.usage_count < coupon.max_usage)
      ) {
        couponId = coupon.id;
        discount =
          coupon.discount_type === "fixed"
            ? Number(coupon.discount_value)
            : Math.round((subtotal * Number(coupon.discount_value)) / 100);
        discount = Math.min(discount, subtotal);
      }
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: input.customer_name,
        phone: input.phone,
        email: input.email,
        district: input.district,
        area: input.area,
        address: input.address,
        notes: input.notes || null,
        delivery_zone: input.delivery_zone,
        subtotal,
        coupon_id: couponId,
        coupon_code: input.coupon_code?.toUpperCase() || null,
        discount,
        delivery_charge: deliveryCharge,
        grand_total: subtotal - discount + deliveryCharge,
        payment_method: input.payment_method,
        transaction_id: input.transaction_id || null,
        payment_status:
          input.payment_method === "cash_on_delivery"
            ? "delivery_charge_submitted"
            : "pending"
      })
      .select("id")
      .single();
    if (orderError) throw orderError;

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));
    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      throw itemsError;
    }

    return NextResponse.json({ order_number: orderNumber }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? error.issues[0]?.message ?? "Please check your information."
        : error instanceof Error
          ? error.message
          : "Could not place the order.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
