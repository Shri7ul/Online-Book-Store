"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Banknote,
  CreditCard,
  LoaderCircle,
  LockKeyhole,
  MapPin
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/components/store/cart-provider";
import type { StoreSettings } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";

type DeliveryZone = "inside_dhaka" | "outside_dhaka";
type PaymentMethod = "cash_on_delivery" | "online";

export function CheckoutForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [zone, setZone] = useState<DeliveryZone>("inside_dhaka");
  const [payment, setPayment] =
    useState<PaymentMethod>("cash_on_delivery");
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const delivery =
    zone === "inside_dhaka"
      ? settings.delivery_inside_dhaka
      : settings.delivery_outside_dhaka;
  const grandTotal = Math.max(0, subtotal - (coupon?.discount ?? 0) + delivery);

  const lineItems = useMemo(
    () =>
      items.map((item) => ({
        book_id: item.book.id,
        quantity: item.quantity
      })),
    [items]
  );

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setCoupon({ code: data.code, discount: data.discount });
      toast.success(`${data.code} applied successfully.`);
    } catch (error) {
      setCoupon(null);
      toast.error(
        error instanceof Error ? error.message : "Coupon could not be applied."
      );
    } finally {
      setCouponLoading(false);
    }
  }

  async function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) {
      toast.error("Your cart is empty.");
      return;
    }
    setSubmitting(true);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email"),
          district: form.get("district"),
          area: form.get("area"),
          address: form.get("address"),
          notes: form.get("notes"),
          delivery_zone: zone,
          payment_method: payment,
          transaction_id: form.get("transaction_id"),
          coupon_code: coupon?.code,
          items: lineItems
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      clearCart();
      router.push(`/order-success?order=${encodeURIComponent(data.order_number)}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not place your order."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!items.length) {
    return (
      <div className="container py-24 text-center">
        <h1 className="font-display text-4xl font-semibold">
          Add a book before checking out.
        </h1>
        <Button className="mt-6" onClick={() => router.push("/shop")}>
          Browse books
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submitOrder}
      className="container grid items-start gap-10 py-10 lg:grid-cols-[1fr_420px] lg:py-14"
    >
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-accent-foreground">
          Secure checkout
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold sm:text-6xl">
          Almost on your shelf.
        </h1>

        <CheckoutSection number="01" title="Customer information">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input name="name" autoComplete="name" required />
            </Field>
            <Field label="Phone number">
              <Input
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="01XXXXXXXXX"
                required
              />
            </Field>
            <Field label="Email address">
              <Input name="email" type="email" autoComplete="email" required />
            </Field>
            <Field label="District">
              <Input name="district" defaultValue="Dhaka" required />
            </Field>
            <Field label="Area">
              <Input name="area" placeholder="e.g. Dhanmondi" required />
            </Field>
            <Field label="Delivery zone">
              <select
                value={zone}
                onChange={(event) =>
                  setZone(event.target.value as DeliveryZone)
                }
                className="h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none focus:border-primary"
              >
                <option value="inside_dhaka">Inside Dhaka</option>
                <option value="outside_dhaka">Outside Dhaka</option>
              </select>
            </Field>
          </div>
          <Field label="Full address">
            <Textarea
              name="address"
              autoComplete="street-address"
              placeholder="House, road, landmark, and any helpful delivery detail"
              required
            />
          </Field>
          <Field label="Order notes (optional)">
            <Textarea
              name="notes"
              className="min-h-20"
              placeholder="Anything our team should know"
            />
          </Field>
        </CheckoutSection>

        <CheckoutSection number="02" title="Payment method">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPayment("cash_on_delivery")}
              className={cn(
                "flex min-h-24 items-center gap-4 rounded-xl border p-5 text-left transition",
                payment === "cash_on_delivery"
                  ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                  : "hover:bg-muted"
              )}
            >
              <Banknote className="size-6 text-primary" />
              <span>
                <strong className="block text-sm">Cash on delivery</strong>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Pay the book total on arrival
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPayment("online")}
              className={cn(
                "flex min-h-24 items-center gap-4 rounded-xl border p-5 text-left transition",
                payment === "online"
                  ? "border-primary bg-primary/5 ring-4 ring-primary/5"
                  : "hover:bg-muted"
              )}
            >
              <CreditCard className="size-6 text-primary" />
              <span>
                <strong className="block text-sm">Online payment</strong>
                <span className="mt-1 block text-xs text-muted-foreground">
                  SSLCommerz integration ready
                </span>
              </span>
            </button>
          </div>

          {payment === "cash_on_delivery" ? (
            <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-5">
              <p className="text-sm leading-7">
                Please send only the delivery charge of{" "}
                <strong>{formatPrice(delivery)}</strong> via bKash, Nagad, or
                Rocket to <strong>{settings.payment_number}</strong> to confirm
                your order.
              </p>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                {settings.payment_instruction}
              </p>
              <Field label="Transaction ID">
                <Input
                  name="transaction_id"
                  className="mt-2 bg-background"
                  placeholder="Enter the payment transaction ID"
                  required
                />
              </Field>
            </div>
          ) : (
            <div className="mt-5 rounded-xl bg-muted p-5 text-sm leading-7 text-muted-foreground">
              The payment adapter supports SSLCommerz, bKash, and Nagad. Until
              live merchant credentials are added, the order is recorded and
              the team will send a secure payment link.
              <input type="hidden" name="transaction_id" value="" />
            </div>
          )}
        </CheckoutSection>
      </div>

      <aside className="sticky top-28 rounded-xl border bg-card p-6 shadow-soft">
        <h2 className="font-display text-2xl font-semibold">Order summary</h2>
        <div className="mt-6 max-h-64 space-y-4 overflow-y-auto pr-2">
          {items.map(({ book, quantity }) => (
            <div key={book.id} className="flex justify-between gap-4 text-sm">
              <p className="line-clamp-2">
                {book.name}{" "}
                <span className="text-muted-foreground">× {quantity}</span>
              </p>
              <span className="shrink-0 font-semibold">
                {formatPrice(
                  (book.discount_price ?? book.regular_price) * quantity
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex gap-2 border-t pt-5">
          <Input
            value={couponCode}
            onChange={(event) =>
              setCouponCode(event.target.value.toUpperCase())
            }
            placeholder="Coupon code"
            className="uppercase"
          />
          <Button
            type="button"
            variant="outline"
            onClick={applyCoupon}
            disabled={couponLoading}
          >
            {couponLoading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              "Apply"
            )}
          </Button>
        </div>
        {coupon && (
          <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-primary">
            <BadgeCheck className="size-4" /> {coupon.code} saved{" "}
            {formatPrice(coupon.discount)}
          </p>
        )}
        <div className="mt-6 space-y-3 border-t pt-5 text-sm">
          <SummaryLine label="Subtotal" value={subtotal} />
          {coupon && (
            <SummaryLine label="Coupon discount" value={-coupon.discount} />
          )}
          <SummaryLine label="Delivery charge" value={delivery} />
        </div>
        <div className="mt-5 flex items-center justify-between border-t pt-5">
          <span className="font-semibold">Grand total</span>
          <span className="font-display text-3xl font-semibold">
            {formatPrice(grandTotal)}
          </span>
        </div>
        <Button
          type="submit"
          size="lg"
          className="mt-6 w-full"
          disabled={submitting}
        >
          {submitting ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            <LockKeyhole className="size-4" />
          )}
          {submitting ? "Placing order..." : "Place order"}
        </Button>
        <p className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <MapPin className="size-3.5" /> Delivery throughout Bangladesh
        </p>
      </aside>
    </form>
  );
}

function CheckoutSection({
  number,
  title,
  children
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10 border-t pt-8">
      <div className="mb-6 flex items-center gap-4">
        <span className="grid size-9 place-items-center rounded-full bg-primary text-xs font-black text-primary-foreground">
          {number}
        </span>
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-bold">
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  );
}

function SummaryLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">
        {value < 0 ? "−" : ""}
        {formatPrice(Math.abs(value))}
      </span>
    </div>
  );
}
