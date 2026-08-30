"use server";

import {
  EMAIL_TEMPLATES,
  ERRORS,
  LINKS,
  NOTIFICATION_TYPES,
  TASK_EVENT_TYPES,
  TASK_MODAL_TABS,
} from "@/const";
import { canEditProject, getUserContext } from "@/lib/supabase/server";
import { createTaskSchema, CreateTaskSchema } from "@/schema";
import { renderLocalizedEmailTemplate, sendEmail } from "@/utils/email";
import {
  generateAbsoluteUrl,
  generateListRoute,
  generateProjectRoute,
} from "@/utils/helpers";
import { revalidatePath } from "next/cache";

export async function createTaskAction(
  listId: string,
  data: CreateTaskSchema,
  parentTaskId?: string,
) {
  const parsed = createTaskSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

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

  let lastTaskQuery = supabase
    .from("tasks")
    .select("position")
    .eq("list_id", listId)
    .order("position", { ascending: false })
    .limit(1);

  lastTaskQuery = parentTaskId
    ? lastTaskQuery.eq("parent_task_id", parentTaskId)
    : lastTaskQuery.is("parent_task_id", null);

  const { data: lastTask } = await lastTaskQuery.maybeSingle();

  const { title, description, status, priority, assigneeId, dueDate } =
    parsed.data;

  if (assigneeId) {
    const { data: canAssign } = await supabase.rpc("can_access_project", {
      p_project_id: list.project_id,
      p_user_id: assigneeId,
    });

    if (!canAssign) return { error: ERRORS.INVALID_ASSIGNEE };
  }

  const { data: task, error: insertError } = await supabase
    .from("tasks")
    .insert({
      project_id: list.project_id,
      list_id: listId,
      parent_task_id: parentTaskId ?? null,
      title,
      description: description || null,
      status,
      priority,
      assignee_id: assigneeId,
      due_date: dueDate,
      position: (lastTask?.position ?? -1) + 1,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (insertError || !task) return { error: ERRORS.SERVER_ERROR };

  await supabase.from("task_events").insert({
    task_id: task.id,
    user_id: user.id,
    type: TASK_EVENT_TYPES.TASK_CREATED,
    metadata: {},
  });

  if (assigneeId && assigneeId !== user.id) {
    const [
      { data: project },
      { data: assignerProfile },
      { data: assigneeProfile },
    ] = await Promise.all([
      supabase
        .from("projects")
        .select("name")
        .eq("id", list.project_id)
        .single(),
      supabase.from("profiles").select("full_name").eq("id", user.id).single(),
      supabase
        .from("profiles")
        .select("email, locale")
        .eq("id", assigneeId)
        .single(),
    ]);

    if (project && assignerProfile) {
      const taskPath = `${generateListRoute(list.project_id, listId)}?taskId=${task.id}&tab=${TASK_MODAL_TABS.DETAILS}`;

      const { error: notificationError } = await supabase.rpc(
        "create_notification",
        {
          p_user_id: assigneeId,
          p_type: NOTIFICATION_TYPES.TASK_ASSIGNED,
          p_metadata: {
            taskTitle: title,
            projectName: project.name,
            assignerName: assignerProfile.full_name,
            taskId: task.id,
          },
          p_link: taskPath,
        },
      );
      if (notificationError) {
        console.error("[create-task] Notification error:", notificationError);
      }

      if (assigneeProfile) {
        try {
          const { data: emailEnabled, error: emailPrefError } =
            await supabase.rpc("get_email_notification_enabled", {
              p_user_id: assigneeId,
              p_type: NOTIFICATION_TYPES.TASK_ASSIGNED,
            });
          if (emailPrefError) {
            console.error(
              "[create-task] Email preference check error:",
              emailPrefError,
            );
          }

          if (emailEnabled ?? true) {
            const { subject, html } = await renderLocalizedEmailTemplate(
              EMAIL_TEMPLATES.TASK_ASSIGNED,
              assigneeProfile.locale,
              {
                taskTitle: title,
                projectName: project.name,
                assignerName: assignerProfile.full_name,
                taskUrl: generateAbsoluteUrl(taskPath),
              },
            );
            await sendEmail(assigneeProfile.email, subject, html);
          }
        } catch (e) {
          console.error("[create-task] Email error:", e);
        }
      }
    }
  }

  revalidatePath(generateProjectRoute(list.project_id));
  revalidatePath(LINKS.DASHBOARD);
  return { success: true };
}
