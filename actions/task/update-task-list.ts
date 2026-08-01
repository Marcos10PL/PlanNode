"use server";

import { ERRORS } from "@/const";
import { canEditProject, getUserContext } from "@/lib/supabase/server";
import { createTaskListSchema, CreateTaskListSchema } from "@/schema";
import { generateProjectRoute } from "@/utils/helpers";
import { revalidatePath } from "next/cache";

export async function updateTaskListAction(
  listId: string,
  data: CreateTaskListSchema,
) {
  const parsed = createTaskListSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

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
    .update({ name: parsed.data.name })
    .eq("id", listId);

  if (updateError) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(generateProjectRoute(list.project_id));
  return { success: true };
}
