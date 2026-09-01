"use client";

import { createClient } from "@/lib/supabase/client";
import { TableName } from "@/types/entities";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const TABLES = [
  "tasks",
  "task_lists",
  "notifications",
] as const satisfies readonly TableName[];

const REFRESH_DEBOUNCE_MS = 400;

export function RealtimeRefresher() {
  const router = useRouter();
  const routerRef = useRef(router);

  useEffect(() => {
    routerRef.current = router;
  }, [router]);

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    const scheduleRefresh = () => {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        refreshTimeout = null;
        routerRef.current.refresh();
      }, REFRESH_DEBOUNCE_MS);
    };

    const subscribe = () => {
      channel = supabase.channel("app-changes");

      for (const table of TABLES) {
        channel = channel.on(
          "postgres_changes",
          { event: "*", schema: "public", table },
          scheduleRefresh,
        );
      }

      channel.subscribe(status => {
        if (
          !disposed &&
          (status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED")
        ) {
          if (channel) supabase.removeChannel(channel);
          retryTimeout = setTimeout(subscribe, 2000);
        }
      });
    };

    // the realtime socket must carry the user's JWT before the channel joins
    // otherwise the subscription is registered as anon and RLS silently
    // filters out every event.
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (disposed) return;
      if (session?.access_token)
        supabase.realtime.setAuth(session.access_token);

      subscribe();
    };

    init();

    return () => {
      disposed = true;
      if (retryTimeout) clearTimeout(retryTimeout);
      if (refreshTimeout) clearTimeout(refreshTimeout);
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const handleFocus = () => router.refresh();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [router]);

  return null;
}
