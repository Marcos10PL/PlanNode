"use server";

import {
  EMAIL_TEMPLATES,
  ERRORS,
  NOTIFICATION_TYPES,
  TASK_MODAL_TABS,
} from "@/const";
import { canEditProject, getUserContext } from "@/lib/supabase/server";
import { createTaskCommentSchema, CreateTaskCommentSchema } from "@/schema";
import { renderLocalizedEmailTemplate, sendEmail } from "@/utils/email";
import { generateAbsoluteUrl, generateListRoute } from "@/utils/helpers";

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
    .select("project_id, list_id, title, assignee_id, created_by")
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

  const recipientIds = [...new Set([task.assignee_id, task.created_by])].filter(
    (id): id is string => !!id && id !== user.id,
  );

  if (recipientIds.length > 0) {
    const [{ data: commenterProfile }, { data: recipientProfiles }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single(),
        supabase
          .from("profiles")
          .select("id, email, locale")
          .in("id", recipientIds),
      ]);

    if (commenterProfile) {
      const taskPath = `${generateListRoute(task.project_id, task.list_id)}?taskId=${taskId}&tab=${TASK_MODAL_TABS.ACTIVITY}`;
      const taskUrl = generateAbsoluteUrl(taskPath);

      await Promise.all(
        (recipientProfiles ?? []).map(async recipientProfile => {
          const { error: notificationError } = await supabase.rpc(
            "create_notification",
            {
              p_user_id: recipientProfile.id,
              p_type: NOTIFICATION_TYPES.TASK_COMMENT_ADDED,
              p_metadata: {
                taskTitle: task.title,
                commenterName: commenterProfile.full_name,
                taskId,
              },
              p_link: taskPath,
            },
          );
          if (notificationError) {
            console.error(
              "[create-task-comment] Notification error:",
              notificationError,
            );
          }

          const { data: emailEnabled } = await supabase.rpc(
            "get_email_notification_enabled",
            {
              p_user_id: recipientProfile.id,
              p_type: NOTIFICATION_TYPES.TASK_COMMENT_ADDED,
            },
          );

          if (emailEnabled) {
            try {
              const { subject, html } = await renderLocalizedEmailTemplate(
                EMAIL_TEMPLATES.TASK_COMMENT_ADDED,
                recipientProfile.locale,
                {
                  taskTitle: task.title,
                  commenterName: commenterProfile.full_name,
                  taskUrl,
                },
              );
              await sendEmail(recipientProfile.email, subject, html);
            } catch (e) {
              console.error("[create-task-comment] Email error:", e);
            }
          }
        }),
      );
    }
  }

  return { success: true };
}
