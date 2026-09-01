"use server";

import { ERRORS } from "@/const";
import { getUserContext, isProjectManager } from "@/lib/supabase/server";
import {
  generateProjectRoute,
  generateProjectTrashRoute,
} from "@/utils/helpers";
import { revalidatePath } from "next/cache";

export async function permanentlyClearProjectTrashAction(projectId: string) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  if (!(await isProjectManager(supabase, projectId, user.id)))
    return { error: ERRORS.INSUFFICIENT_ROLE };

  const [{ error: listsError }, { error: tasksError }] = await Promise.all([
    supabase
      .from("task_lists")
      .delete()
      .eq("project_id", projectId)
      .not("deleted_at", "is", null),
    supabase
      .from("tasks")
      .delete()
      .eq("project_id", projectId)
      .not("deleted_at", "is", null),
  ]);

  if (listsError || tasksError) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(generateProjectRoute(projectId));
  revalidatePath(generateProjectTrashRoute(projectId));
  return { success: true };
}
