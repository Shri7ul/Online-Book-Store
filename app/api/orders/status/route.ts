import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/repositories/catalog";
import { rateLimit } from "@/lib/server/security";
import { createAdminClient } from "@/lib/supabase/admin";

const querySchema = z.object({
  order: z.string().min(6).max(40),
  token: z.string().uuid()
});

export async function GET(request: Request) {
  try {
    await rateLimit("order-status", 60);
    const url = new URL(request.url);
    const query = querySchema.parse({
      order: url.searchParams.get("order"),
      token: url.searchParams.get("token")
    });

    if (!isSupabaseConfigured) {
      return NextResponse.json({
        status: "pending",
        events: [
          {
            status: "pending",
            note: "Order received",
            created_at: new Date().toISOString()
          }
        ]
      });
    }

    const supabase = createAdminClient();
    const { data: order, error } = await supabase
      .from("orders")
      .select("id,status")
      .eq("order_number", query.order)
      .eq("public_token", query.token)
      .maybeSingle();
    if (error || !order)
      return NextResponse.json({ error: "Order not found." }, { status: 404 });

    const { data: events } = await supabase
      .from("order_status_events")
      .select("status,note,created_at")
      .eq("order_id", order.id)
      .order("created_at");

    return NextResponse.json(
      { status: order.status, events: events ?? [] },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch {
    return NextResponse.json({ error: "Invalid tracking link." }, { status: 400 });
  }
}
