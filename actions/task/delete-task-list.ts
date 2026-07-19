"use server";

import { ERRORS } from "@/const";
import { canEditProject, getUserContext } from "@/lib/supabase/server";
import { generateProjectRoute } from "@/utils/helpers";
import { revalidatePath } from "next/cache";

export async function deleteTaskListAction(listId: string) {
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

  const { count } = await supabase
    .from("task_lists")
    .select("*", { count: "exact", head: true })
    .eq("project_id", list.project_id);

  if ((count ?? 0) <= 1) return { error: ERRORS.CANNOT_DELETE_LAST_LIST };

  const { error: deleteError } = await supabase
    .from("task_lists")
    .delete()
    .eq("id", listId);

  if (deleteError) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(generateProjectRoute(list.project_id));
  return { success: true };
}
