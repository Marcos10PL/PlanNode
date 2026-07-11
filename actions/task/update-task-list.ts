"use server";

import { ERRORS } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
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

  const { data: list, error: updateError } = await supabase
    .from("task_lists")
    .update({ name: parsed.data.name })
    .eq("id", listId)
    .select("project_id")
    .single();

  if (updateError || !list) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(generateProjectRoute(list.project_id));
  return { success: true };
}
