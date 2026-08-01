"use server";

import { ERRORS } from "@/const";
import { getUserContext, isProjectManager } from "@/lib/supabase/server";

export async function deleteTaskCommentAction(commentId: string) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: comment, error: fetchError } = await supabase
    .from("task_comments")
    .select("user_id, task:tasks!inner(project_id)")
    .eq("id", commentId)
    .single();

  if (fetchError || !comment) return { error: ERRORS.SERVER_ERROR };

  const isAuthor = comment.user_id === user.id;
  const isManager =
    !isAuthor &&
    (await isProjectManager(supabase, comment.task.project_id, user.id));

  if (!isAuthor && !isManager) return { error: ERRORS.INSUFFICIENT_ROLE };

  const { error: deleteError } = await supabase
    .from("task_comments")
    .delete()
    .eq("id", commentId);

  if (deleteError) return { error: ERRORS.SERVER_ERROR };

  return { success: true };
}
