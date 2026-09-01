"use client";

import { createClient } from "@/lib/supabase/client";
import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./user-provider";
import { useWorkspaces } from "./workspace-provider";

type PresenceContextValue = {
  isOnline: (userId: string) => boolean;
};

const PresenceContext = createContext<PresenceContextValue | null>(null);

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { activeWorkspace } = useWorkspaces();
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!activeWorkspace) {
      return;
    }

    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    const subscribe = () => {
      channel = supabase.channel(`presence:workspace:${activeWorkspace.id}`, {
        config: { presence: { key: user.id } },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          if (!channel) return;
          setOnlineUserIds(new Set(Object.keys(channel.presenceState())));
        })
        .subscribe(async status => {
          if (status === "SUBSCRIBED") {
            await channel?.track({ online_at: new Date().toISOString() });
          }

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
    // otherwise the subscription is registered as anon (see realtime-refresher.tsx)
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
      setOnlineUserIds(new Set());
      if (retryTimeout) clearTimeout(retryTimeout);
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace?.id, user.id]);

  const isOnline = (userId: string) => onlineUserIds.has(userId);

  return <PresenceContext value={{ isOnline }}>{children}</PresenceContext>;
}

const FALLBACK_PRESENCE: PresenceContextValue = { isOnline: () => false };

export function usePresence() {
  const context = useContext(PresenceContext);
  if (!context) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("usePresence used outside PresenceProvider");
    }
    return FALLBACK_PRESENCE;
  }
  return context;
}
