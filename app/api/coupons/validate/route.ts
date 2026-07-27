import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/repositories/catalog";
import { enforceSameOrigin, rateLimit } from "@/lib/server/security";

const schema = z.object({
  code: z.string().trim().min(3).max(30).transform((value) => value.toUpperCase()),
  subtotal: z.coerce.number().positive()
});

const demoCoupons: Record<
  string,
  { type: "fixed" | "percentage"; value: number; minimum: number }
> = {
  LEON10: { type: "fixed", value: 100, minimum: 500 },
  READ15: { type: "percentage", value: 15, minimum: 800 },
  COTTAGE50: { type: "fixed", value: 50, minimum: 350 }
};

export async function POST(request: Request) {
  try {
    await enforceSameOrigin();
    await rateLimit("coupon", 20);
    const input = schema.parse(await request.json());

    if (!isSupabaseConfigured) {
      const coupon = demoCoupons[input.code];
      if (!coupon) throw new Error("This coupon is not valid.");
      if (input.subtotal < coupon.minimum)
        throw new Error(
          `Minimum purchase of ৳${coupon.minimum} is required.`
        );
      const discount =
        coupon.type === "fixed"
          ? coupon.value
          : Math.round((input.subtotal * coupon.value) / 100);
      return NextResponse.json({ code: input.code, discount });
    }

    const supabase = createAdminClient();
    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", input.code)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !coupon) throw new Error("This coupon is not valid.");
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
      throw new Error("This coupon has expired.");
    if (coupon.max_usage && coupon.usage_count >= coupon.max_usage)
      throw new Error("This coupon has reached its usage limit.");
    if (input.subtotal < Number(coupon.minimum_purchase))
      throw new Error(
        `Minimum purchase of ৳${coupon.minimum_purchase} is required.`
      );

    const discount =
      coupon.discount_type === "fixed"
        ? Number(coupon.discount_value)
        : Math.round((input.subtotal * Number(coupon.discount_value)) / 100);

    return NextResponse.json({
      code: coupon.code,
      discount: Math.min(discount, input.subtotal)
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Coupon could not be applied.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
