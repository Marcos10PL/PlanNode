"use server";

import { ERRORS } from "@/const";
import { canEditProject, getUserContext } from "@/lib/supabase/server";
import { createTaskCommentSchema, CreateTaskCommentSchema } from "@/schema";

export async function createTaskCommentAction(
  taskId: string,
  data: CreateTaskCommentSchema,
) {
  const parsed = createTaskCommentSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

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

  const { error: insertError } = await supabase.from("task_comments").insert({
    task_id: taskId,
    user_id: user.id,
    content: parsed.data.content,
  });

  if (insertError) return { error: ERRORS.SERVER_ERROR };

  return { success: true };
}
