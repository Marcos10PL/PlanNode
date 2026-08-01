"use server";

import { ERRORS } from "@/const";
import { canEditProject, getUserContext } from "@/lib/supabase/server";
import { TaskStatus } from "@/types/entities";
import { generateProjectRoute } from "@/utils/helpers";
import { revalidatePath } from "next/cache";

type TaskPositionChange = {
  id: string;
  position: number;
  status?: TaskStatus;
};

export async function reorderTasksAction(
  listId: string,
  changes: TaskPositionChange[],
) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: list, error: listError } = await supabase
    .from("task_lists")
    .select("project_id")
    .eq("id", listId)
    .single();

  if (listError || !list) return { error: ERRORS.SERVER_ERROR };

  if (!(await canEditProject(supabase, list.project_id, user.id)))
    return { error: ERRORS.INSUFFICIENT_ROLE };

  const { error: reorderError } = await supabase.rpc("reorder_tasks", {
    p_list_id: listId,
    p_changes: changes,
  });

  if (reorderError) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(generateProjectRoute(list.project_id));
  return { success: true };
}
