"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const ADMIN_ORDER_REALTIME_EVENT = "admin-order-realtime";

export function AdminOrderRealtimeRefresh() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    void (async () => {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Admin realtime session failed.", error);
        return;
      }
      if (!session) {
        console.error("Admin realtime session is unavailable.");
        return;
      }

      await supabase.realtime.setAuth(session.access_token);
      if (cancelled) return;

      channel = supabase
        .channel("admin-order-refresh")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders" },
          (payload) => {
            window.dispatchEvent(
              new CustomEvent(ADMIN_ORDER_REALTIME_EVENT, {
                detail: payload
              })
            );
            router.refresh();
          }
        )
        .subscribe((status, subscriptionError) => {
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error("Admin order realtime subscription failed.", {
              status,
              error: subscriptionError
            });
          }
        });
    })().catch((initializationError) => {
      console.error(
        "Admin order realtime initialization failed.",
        initializationError
      );
    });

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
