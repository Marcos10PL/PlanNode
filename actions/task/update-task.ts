"use server";

import { ERRORS, LINKS, NOTIFICATION_TYPES } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { updateTaskSchema, UpdateTaskSchema } from "@/schema";
import { generateProjectRoute } from "@/utils/helpers";
import { revalidatePath } from "next/cache";

export async function updateTaskAction(taskId: string, data: UpdateTaskSchema) {
  const parsed = updateTaskSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: existing, error: fetchError } = await supabase
    .from("tasks")
    .select("project_id, assignee_id")
    .eq("id", taskId)
    .single();

  if (fetchError || !existing) return { error: ERRORS.SERVER_ERROR };

  const { title, description, status, priority, assigneeId, dueDate } =
    parsed.data;

  const { error: updateError } = await supabase
    .from("tasks")
    .update({
      title,
      description: description || null,
      status,
      priority,
      assignee_id: assigneeId,
      due_date: dueDate,
    })
    .eq("id", taskId);

  if (updateError) return { error: ERRORS.SERVER_ERROR };

  const assigneeChanged =
    assigneeId && assigneeId !== existing.assignee_id && assigneeId !== user.id;

  if (assigneeChanged) {
    const [{ data: project }, { data: assignerProfile }] = await Promise.all([
      supabase
        .from("projects")
        .select("name")
        .eq("id", existing.project_id)
        .single(),
      supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    ]);

    if (project && assignerProfile) {
      await supabase.rpc("create_notification", {
        p_user_id: assigneeId,
        p_type: NOTIFICATION_TYPES.TASK_ASSIGNED,
        p_metadata: {
          taskTitle: title,
          projectName: project.name,
          assignerName: assignerProfile.full_name,
          taskId,
        },
        p_link: generateProjectRoute(existing.project_id),
      });
    }
  }

  revalidatePath(generateProjectRoute(existing.project_id));
  revalidatePath(LINKS.DASHBOARD);
  return { success: true };
}
