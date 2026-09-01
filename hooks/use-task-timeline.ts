"use client";

import { getTaskTimelineAction } from "@/actions/task/get-task-timeline";
import { createClient } from "@/lib/supabase/client";
import { TaskTimelineItem } from "@/types/dto";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function useTaskTimeline(taskId: string | undefined, open: boolean) {
  const tCommon = useTranslations("common");
  const [items, setItems] = useState<TaskTimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [prevTaskId, setPrevTaskId] = useState(taskId);
  if (taskId !== prevTaskId) {
    setPrevTaskId(taskId);
    setItems([]);
  }

  const refetch = useCallback(async () => {
    if (!taskId) return;
    try {
      const result = await getTaskTimelineAction(taskId);
      setItems(result.items);
    } catch {
      toast.error(tCommon("unexpected_error"));
    }
  }, [taskId, tCommon]);

  // kept separate from the subscription effect below so a refetch identity
  // change (e.g. tCommon re-rendering) never tears down and re-subscribes
  // the realtime channel — only open/taskId actually changing should do that
  const refetchRef = useRef(refetch);
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  useEffect(() => {
    if (!open || !taskId) {
      return;
    }

    let disposed = false;

    const load = async () => {
      setIsLoading(true);
      try {
        await refetchRef.current();
      } finally {
        if (!disposed) setIsLoading(false);
      }
    };
    load();

    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    // the realtime socket must carry the user's JWT before the channel joins
    // otherwise the subscription is registered as anon (see realtime-refresher.tsx)
    const subscribe = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (disposed) return;
      if (session?.access_token)
        supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`task-timeline:${taskId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "task_events",
            filter: `task_id=eq.${taskId}`,
          },
          () => refetchRef.current(),
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "task_comments",
            filter: `task_id=eq.${taskId}`,
          },
          () => refetchRef.current(),
        )
        .subscribe();
    };

    subscribe();

    return () => {
      disposed = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [open, taskId]);

  return { items, isLoading, refetch };
}
