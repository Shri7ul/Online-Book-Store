"use client";

import { useEffect, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = ["pending", "confirmed", "packed", "shipped", "delivered"];

export function OrderStatusTracker({
  order,
  token
}: {
  order: string;
  token: string;
}) {
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch(
          `/api/orders/status?order=${encodeURIComponent(order)}&token=${encodeURIComponent(token)}`,
          { cache: "no-store" }
        );
        const data = await response.json();
        if (active && response.ok) setStatus(data.status);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    const interval = window.setInterval(load, 15_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [order, token]);

  if (status === "cancelled" || status === "returned") {
    return (
      <div className="mt-9 rounded-xl border bg-muted p-5 text-sm">
        Current status:{" "}
        <strong className="capitalize">{status}</strong>. Contact support if you
        need more information.
      </div>
    );
  }

  const activeIndex = steps.indexOf(status);
  return (
    <div className="mt-9 rounded-xl border bg-card p-5 text-left sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.12em]">
          Live order status
        </p>
        {loading && <LoaderCircle className="size-4 animate-spin" />}
      </div>
      <div className="grid grid-cols-5">
        {steps.map((step, index) => {
          const complete = index <= activeIndex;
          return (
            <div key={step} className="relative text-center">
              {index > 0 && (
                <span
                  className={cn(
                    "absolute right-1/2 top-4 h-0.5 w-full bg-border",
                    complete && "bg-primary"
                  )}
                />
              )}
              <span
                className={cn(
                  "relative z-10 mx-auto grid size-8 place-items-center rounded-full border bg-background text-[10px] font-black",
                  complete &&
                    "border-primary bg-primary text-primary-foreground"
                )}
              >
                {complete ? <Check className="size-3.5" /> : index + 1}
              </span>
              <p className="mt-2 truncate text-[9px] font-bold capitalize text-muted-foreground sm:text-xs">
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
