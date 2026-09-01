"use server";

import { ERRORS } from "@/const";
import { canEditProject, getUserContext } from "@/lib/supabase/server";
import {
  generateProjectRoute,
  generateProjectTrashRoute,
} from "@/utils/helpers";
import { revalidatePath } from "next/cache";

export async function restoreTaskListAction(listId: string) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: list, error: fetchError } = await supabase
    .from("task_lists")
    .select("project_id")
    .eq("id", listId)
    .single();

  if (fetchError || !list) return { error: ERRORS.SERVER_ERROR };

  if (!(await canEditProject(supabase, list.project_id, user.id)))
    return { error: ERRORS.INSUFFICIENT_ROLE };

  const { error: updateError } = await supabase
    .from("task_lists")
    .update({ deleted_at: null })
    .eq("id", listId);

  if (updateError) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(generateProjectRoute(list.project_id));
  revalidatePath(generateProjectTrashRoute(list.project_id));
  return { success: true };
}
