import type { Metadata } from "next";
import { CartPage } from "@/components/store/cart-page";

export const metadata: Metadata = { title: "Your cart" };

export default function CartRoute() {
  return <CartPage />;
}
