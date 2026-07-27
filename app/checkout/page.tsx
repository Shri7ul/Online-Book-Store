import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/checkout-form";
import { getSettings } from "@/lib/repositories/catalog";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const settings = await getSettings();
  return <CheckoutForm settings={settings} />;
}
