"use server";

import { ERRORS, LINKS, NOTIFICATION_TYPES, TASK_EVENT_TYPES } from "@/const";
import { canEditProject, getUserContext } from "@/lib/supabase/server";
import { updateTaskSchema, UpdateTaskSchema } from "@/schema";
import { TaskEventMetadata } from "@/types/dto";
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
    .select("project_id, assignee_id, title, status, priority, due_date")
    .eq("id", taskId)
    .single();

  if (fetchError || !existing) return { error: ERRORS.SERVER_ERROR };

  if (!(await canEditProject(supabase, existing.project_id, user.id)))
    return { error: ERRORS.INSUFFICIENT_ROLE };

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

  if (assigneeId) {
    const { data: canAssign } = await supabase.rpc("can_access_project", {
      p_project_id: existing.project_id,
      p_user_id: assigneeId,
    });

    if (!canAssign) return { error: ERRORS.INVALID_ASSIGNEE };
  }

  const { error: updateError } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId);

  if (updateError) return { error: ERRORS.SERVER_ERROR };

  const events: {
    type: string;
    metadata: TaskEventMetadata;
  }[] = [];

  if (status !== undefined && status !== existing.status) {
    events.push({
      type: TASK_EVENT_TYPES.STATUS_CHANGED,
      metadata: { from: existing.status, to: status },
    });
  }

  if (priority !== undefined && priority !== existing.priority) {
    events.push({
      type: TASK_EVENT_TYPES.PRIORITY_CHANGED,
      metadata: { from: existing.priority, to: priority },
    });
  }

  if (dueDate !== undefined && dueDate !== existing.due_date) {
    events.push({
      type: TASK_EVENT_TYPES.DUE_DATE_CHANGED,
      metadata: { from: existing.due_date, to: dueDate },
    });
  }

  const assigneeIdChanged =
    assigneeId !== undefined && assigneeId !== existing.assignee_id;

  if (assigneeIdChanged) {
    const idsToFetch = [existing.assignee_id, assigneeId].filter(
      (id): id is string => !!id,
    );

    const { data: assigneeProfiles } = idsToFetch.length
      ? await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", idsToFetch)
      : { data: [] };

    const profileById = new Map((assigneeProfiles ?? []).map(p => [p.id, p]));
    const fromProfile = existing.assignee_id
      ? profileById.get(existing.assignee_id)
      : undefined;
    const toProfile = assigneeId ? profileById.get(assigneeId) : undefined;

    events.push({
      type: TASK_EVENT_TYPES.ASSIGNEE_CHANGED,
      metadata: {
        fromName: fromProfile?.full_name ?? null,
        fromEmail: fromProfile?.email ?? null,
        toName: toProfile?.full_name ?? null,
        toEmail: toProfile?.email ?? null,
      },
    });
  }

  if (events.length > 0) {
    await supabase.from("task_events").insert(
      events.map(e => ({
        task_id: taskId,
        user_id: user.id,
        type: e.type,
        metadata: e.metadata,
      })),
    );
  }

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
