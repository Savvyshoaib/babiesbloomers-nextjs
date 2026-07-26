"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

/**
 * Keeps account order views in sync when admin updates status.
 * Uses Supabase Realtime + a light polling fallback.
 */
export function OrdersRealtimeSync({ userId }: { userId: string }) {
  const router = useRouter();
  const lastToastAt = useRef(0);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    function refreshFromUpdate(status?: string) {
      const now = Date.now();
      if (now - lastToastAt.current > 1500) {
        lastToastAt.current = now;
        toast.info(
          status
            ? `Order status updated: ${status}`
            : "Order status updated",
        );
      }
      router.refresh();
    }

    const channel = supabase
      .channel(`orders-user-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const next = payload.new as { status?: string };
          refreshFromUpdate(next.status);
        },
      )
      .subscribe();

    const poll = window.setInterval(() => {
      router.refresh();
    }, 20000);

    return () => {
      window.clearInterval(poll);
      void supabase.removeChannel(channel);
    };
  }, [userId, router]);

  return null;
}
