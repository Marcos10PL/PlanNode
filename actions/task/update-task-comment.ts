"use server";

import { ERRORS } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import { createTaskCommentSchema, CreateTaskCommentSchema } from "@/schema";

export async function updateTaskCommentAction(
  commentId: string,
  data: CreateTaskCommentSchema,
) {
  const parsed = createTaskCommentSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: comment, error: fetchError } = await supabase
    .from("task_comments")
    .select("user_id")
    .eq("id", commentId)
    .single();

  if (fetchError || !comment) return { error: ERRORS.SERVER_ERROR };

  if (comment.user_id !== user.id) return { error: ERRORS.INSUFFICIENT_ROLE };

  const { error: updateError } = await supabase
    .from("task_comments")
    .update({ content: parsed.data.content })
    .eq("id", commentId);

  if (updateError) return { error: ERRORS.SERVER_ERROR };

  return { success: true };
}
