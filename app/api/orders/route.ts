import { NextResponse } from "next/server";
import { z } from "zod";
import { demoBooks } from "@/lib/demo-data";
import {
  isSupabaseAdminConfigured,
  isSupabaseConfigured
} from "@/lib/repositories/catalog";
import {
  enforceSameOrigin,
  HttpError,
  rateLimit
} from "@/lib/server/security";
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
        book_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(20)
      })
    )
    .min(1)
    .max(50)
}).superRefine((value, context) => {
  const ids = value.items.map((item) => item.book_id);
  if (new Set(ids).size !== ids.length) {
    context.addIssue({
      code: "custom",
      path: ["items"],
      message: "Duplicate books are not allowed."
    });
  }
});

export async function POST(request: Request) {
  try {
    await enforceSameOrigin();
    await rateLimit("order", 6, 10 * 60_000);
    const input = orderSchema.parse(await request.json());
    if (input.payment_method === "cash_on_delivery" && !input.transaction_id) {
      throw new HttpError(
        "The delivery-charge transaction ID is required.",
        400
      );
    }

    const orderNumber = `MBC-${Date.now().toString(36).toUpperCase()}-${crypto
      .randomUUID()
      .slice(0, 4)
      .toUpperCase()}`;
    const trackingToken = crypto.randomUUID();

    if (!isSupabaseConfigured) {
      for (const item of input.items) {
        const book = demoBooks.find((entry) => entry.id === item.book_id);
        if (!book || book.stock < item.quantity)
          throw new Error("One or more books are no longer available.");
      }
      return NextResponse.json(
        { order_number: orderNumber, tracking_token: trackingToken },
        { status: 201 }
      );
    }

    if (!isSupabaseAdminConfigured) {
      throw new HttpError(
        "Checkout is temporarily unavailable. Please contact support.",
        503
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("create_store_order", {
      order_input: input,
      generated_order_number: orderNumber,
      generated_public_token: trackingToken
    });
    if (error) {
      console.error("Order RPC failed.", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }
    const created = data?.[0];
    if (!created) throw new Error("Order creation returned no result.");

    return NextResponse.json(
      {
        order_number: created.created_order_number,
        tracking_token: created.tracking_token
      },
      { status: 201 }
    );
  } catch (error) {
    const response = getOrderErrorResponse(error);
    if (response.status === 500)
      console.error("Order creation failed.", error);
    return NextResponse.json(response.body, { status: response.status });
  }
}

function getOrderErrorResponse(error: unknown): {
  status: number;
  body: Record<string, unknown>;
} {
  if (error instanceof z.ZodError) {
    return {
      status: 400,
      body: {
        error: error.issues
          .map((issue) => {
            const path = issue.path.join(".");
            return path ? `${path}: ${issue.message}` : issue.message;
          })
          .join("; "),
        issues: error.issues
      }
    };
  }

  if (error instanceof HttpError) {
    return {
      status: error.status,
      body: { error: error.message }
    };
  }

  if (error && typeof error === "object") {
    const databaseError = error as {
      code?: unknown;
      message?: unknown;
      details?: unknown;
      hint?: unknown;
    };
    const message =
      typeof databaseError.message === "string"
        ? databaseError.message
        : JSON.stringify(error);
    return {
      status: databaseError.code === "P0001" ? 400 : 500,
      body: {
        error: message,
        code: databaseError.code ?? null,
        details: databaseError.details ?? null,
        hint: databaseError.hint ?? null
      }
    };
  }

  return {
    status: 500,
    body: { error: String(error) }
  };
}
