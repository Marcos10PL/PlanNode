"use server";

import { ERRORS, LINKS, NOTIFICATION_TYPES } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import { updateTaskSchema, UpdateTaskSchema } from "@/schema";
import { TablesUpdate } from "@/types/supabase";
import { generateProjectRoute } from "@/utils/helpers";
import { revalidatePath } from "next/cache";

export async function updateTaskAction(taskId: string, data: UpdateTaskSchema) {
  const parsed = updateTaskSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: existing, error: fetchError } = await supabase
    .from("tasks")
    .select("project_id, assignee_id, title")
    .eq("id", taskId)
    .single();

  if (fetchError || !existing) return { error: ERRORS.SERVER_ERROR };

  const { title, description, status, priority, assigneeId, dueDate } =
    parsed.data;

  const updates: TablesUpdate<"tasks"> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description || null;
  if (status !== undefined) updates.status = status;
  if (priority !== undefined) updates.priority = priority;
  if (assigneeId !== undefined) updates.assignee_id = assigneeId;
  if (dueDate !== undefined) updates.due_date = dueDate;

  if (Object.keys(updates).length === 0) return { success: true };

  const { error: updateError } = await supabase
    .from("tasks")
    .update(updates)
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
          taskTitle: title ?? existing.title,
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
