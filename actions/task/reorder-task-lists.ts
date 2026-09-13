"use server";

import { ERRORS } from "@/const";
import { canEditProject, getUserContext } from "@/lib/supabase/server";

type TaskListPositionChange = { id: string; position: number };

export async function reorderTaskListsAction(
  projectId: string,
  changes: TaskListPositionChange[],
) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  if (!(await canEditProject(supabase, projectId, user.id)))
    return { error: ERRORS.INSUFFICIENT_ROLE };

  const results = await Promise.all(
    changes.map(({ id, position }) =>
      supabase
        .from("task_lists")
        .update({ position })
        .eq("id", id)
        .eq("project_id", projectId),
    ),
  );

  if (results.some(r => r.error)) return { error: ERRORS.SERVER_ERROR };

  return { success: true };
}
