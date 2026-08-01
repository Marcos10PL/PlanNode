import { TASK_STATUSES } from "@/const";
import { MyTask, Task, TaskEvent, TaskListWithTasks } from "@/types/dto";
import type { QueryData } from "@supabase/supabase-js";
import { cache } from "react";
import { Client, requireUserContext } from "../supabase/server";

const TASK_SELECT =
  "id, project_id, list_id, parent_task_id, title, description, status, priority, assignee_id, due_date, position, created_by, assignee:profiles!tasks_assignee_id_fkey(id, full_name, email)";

const taskRowQuery = (supabase: Client) =>
  supabase.from("tasks").select(TASK_SELECT);

type TaskRow = QueryData<ReturnType<typeof taskRowQuery>>[number];

const mapTask = (t: TaskRow) =>
  ({
    id: t.id,
    projectId: t.project_id,
    listId: t.list_id,
    parentTaskId: t.parent_task_id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    assigneeId: t.assignee_id,
    dueDate: t.due_date,
    position: t.position,
    createdBy: t.created_by,
    assignee: t.assignee
      ? {
          id: t.assignee.id,
          fullName: t.assignee.full_name,
          email: t.assignee.email,
        }
      : null,
  }) satisfies Task;

export const getTaskList = cache(async (listId: string) => {
  const { supabase } = await requireUserContext();

  const { data } = await supabase
    .from("task_lists")
    .select(`id, project_id, name, position, tasks(${TASK_SELECT})`)
    .eq("id", listId)
    .order("position", { referencedTable: "tasks", ascending: true })
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    projectId: data.project_id,
    name: data.name,
    position: data.position,
    tasks: data.tasks.map(mapTask),
  } satisfies TaskListWithTasks;
});

const TASK_EVENT_SELECT =
  "id, task_id, type, metadata, created_at, user:profiles!task_events_user_id_fkey(id, full_name, email)";

const taskEventRowQuery = (supabase: Client) =>
  supabase.from("task_events").select(TASK_EVENT_SELECT);

type TaskEventRow = QueryData<ReturnType<typeof taskEventRowQuery>>[number];

const mapTaskEvent = (e: TaskEventRow) =>
  ({
    id: e.id,
    taskId: e.task_id,
    type: e.type,
    metadata: e.metadata as TaskEvent["metadata"],
    createdAt: e.created_at,
    user: e.user
      ? { id: e.user.id, fullName: e.user.full_name, email: e.user.email }
      : null,
  }) satisfies TaskEvent;

export const getTaskEvents = cache(async (taskId: string) => {
  const { supabase } = await requireUserContext();

  const { data } = await supabase
    .from("task_events")
    .select(TASK_EVENT_SELECT)
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });

  return data?.map(mapTaskEvent) ?? [];
});

export const getMyTasks = cache(async (workspaceId: string) => {
  const { supabase, user } = await requireUserContext();

  const { data } = await supabase
    .from("tasks")
    .select(`${TASK_SELECT}, project:projects!inner(name, workspace_id)`)
    .eq("assignee_id", user.id)
    .eq("project.workspace_id", workspaceId)
    .not("status", "in", `(${TASK_STATUSES.DONE},${TASK_STATUSES.CANCELLED})`)
    .order("due_date", { ascending: true, nullsFirst: false });

  return (
    data?.map(
      ({ project, ...t }) =>
        ({
          ...mapTask(t),
          projectName: project.name,
        }) satisfies MyTask,
    ) ?? []
  );
});
