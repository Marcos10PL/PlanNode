"use server";

import { ERRORS, LINKS, NOTIFICATION_TYPES } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import { createTaskSchema, CreateTaskSchema } from "@/schema";
import { generateProjectRoute } from "@/utils/helpers";
import { revalidatePath } from "next/cache";

export async function createTaskAction(
  listId: string,
  data: CreateTaskSchema,
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

  const { data: lastTask } = await supabase
    .from("tasks")
    .select("position")
    .eq("list_id", listId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { title, description, status, priority, assigneeId, dueDate } =
    parsed.data;

  const { data: task, error: insertError } = await supabase
    .from("tasks")
    .insert({
      project_id: list.project_id,
      list_id: listId,
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

  if (assigneeId && assigneeId !== user.id) {
    const [{ data: project }, { data: assignerProfile }] = await Promise.all([
      supabase
        .from("projects")
        .select("name")
        .eq("id", list.project_id)
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
          taskId: task.id,
        },
        p_link: generateProjectRoute(list.project_id),
      });
    }
  }

  revalidatePath(generateProjectRoute(list.project_id));
  revalidatePath(LINKS.DASHBOARD);
  return { success: true };
}
