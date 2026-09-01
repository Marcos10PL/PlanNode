"use server";

import { ERRORS, LINKS } from "@/const";
import { canEditProject, getUserContext } from "@/lib/supabase/server";
import {
  generateProjectRoute,
  generateProjectTrashRoute,
} from "@/utils/helpers";
import { revalidatePath } from "next/cache";

export async function restoreTaskAction(taskId: string) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("project_id")
    .eq("id", taskId)
    .single();

  if (fetchError || !task) return { error: ERRORS.SERVER_ERROR };

  if (!(await canEditProject(supabase, task.project_id, user.id)))
    return { error: ERRORS.INSUFFICIENT_ROLE };

  const { data: subtasks } = await supabase
    .from("tasks")
    .select("id")
    .eq("parent_task_id", taskId);

  const idsToRestore = [taskId, ...(subtasks ?? []).map(s => s.id)];

  const { error: updateError } = await supabase
    .from("tasks")
    .update({ deleted_at: null })
    .in("id", idsToRestore);

  if (updateError) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(generateProjectRoute(task.project_id));
  revalidatePath(generateProjectTrashRoute(task.project_id));
  revalidatePath(LINKS.DASHBOARD);
  return { success: true };
}
