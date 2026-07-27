import Link from "next/link";
import { BadgeCheck, Facebook, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatusTracker } from "@/components/store/order-status-tracker";
import { getSettings } from "@/lib/repositories/catalog";

export const dynamic = "force-dynamic";

export default async function OrderSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ order?: string; token?: string }>;
}) {
  const [{ order, token }, settings] = await Promise.all([
    searchParams,
    getSettings()
  ]);
  return (
    <div className="container grid min-h-[65vh] place-items-center py-16">
      <div className="max-w-2xl text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-primary text-primary-foreground">
          <BadgeCheck className="size-9" />
        </span>
        <p className="mt-7 text-xs font-black uppercase tracking-[0.16em] text-accent-foreground">
          Order {order ? `#${order}` : "received"}
        </p>
        <h1 className="font-display mt-3 text-balance text-4xl font-semibold sm:text-6xl">
          Thank you for your order.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-muted-foreground">
          {settings.confirmation_message}
        </p>
        {order && token && <OrderStatusTracker order={order} token={token} />}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {settings.facebook_url && (
            <Button asChild>
              <Link href={settings.facebook_url}>
                <Facebook className="size-4" /> Facebook page
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href={`tel:${settings.support_phone}`}>
              <Phone className="size-4" /> {settings.support_phone}
            </Link>
          </Button>
        </div>
        <Button asChild variant="ghost" className="mt-5">
          <Link href="/shop">Continue browsing</Link>
        </Button>
      </div>
    </div>
  );
}
