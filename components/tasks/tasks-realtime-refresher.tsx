"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  projectId?: string;
};

export function TasksRealtimeRefresher({ projectId }: Props) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const filter = projectId ? `project_id=eq.${projectId}` : undefined;

    const channel = supabase
      .channel(projectId ? `project-${projectId}` : "tasks-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks", filter },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tasks", filter },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "tasks" },
        () => router.refresh(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "task_lists", filter },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, projectId]);

  return null;
}
