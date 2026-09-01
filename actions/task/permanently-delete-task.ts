"use server";

import { ERRORS, LINKS } from "@/const";
import { getUserContext, isProjectManager } from "@/lib/supabase/server";
import {
  generateProjectRoute,
  generateProjectTrashRoute,
} from "@/utils/helpers";
import { revalidatePath } from "next/cache";

export async function permanentlyDeleteTaskAction(taskId: string) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("project_id, created_by")
    .eq("id", taskId)
    .single();

  if (fetchError || !task) return { error: ERRORS.SERVER_ERROR };

  const isManager = await isProjectManager(supabase, task.project_id, user.id);
  if (!isManager && task.created_by !== user.id)
    return { error: ERRORS.INSUFFICIENT_ROLE };

  const { error: deleteError } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (deleteError) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(generateProjectRoute(task.project_id));
  revalidatePath(generateProjectTrashRoute(task.project_id));
  revalidatePath(LINKS.DASHBOARD);
  return { success: true };
}
