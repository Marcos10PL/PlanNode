import { TASK_STATUSES } from "@/const";
import {
  MyTask,
  Task,
  TaskComment,
  TaskEvent,
  TaskListWithTasks,
  TaskTimelineItem,
} from "@/types/dto";
import type { QueryData } from "@supabase/supabase-js";
import { cache } from "react";
import { Client, requireUserContext } from "../supabase/server";

const TASK_SELECT =
  "id, project_id, list_id, parent_task_id, title, description, status, priority, assignee_id, due_date, position, created_by, deleted_at, assignee:profiles!tasks_assignee_id_fkey(id, full_name, email)";

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
    deletedAt: t.deleted_at,
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
    .select(
      `id, project_id, name, position, created_by, deleted_at, tasks(${TASK_SELECT})`,
    )
    .eq("id", listId)
    .is("deleted_at", null)
    .order("position", { referencedTable: "tasks", ascending: true })
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    projectId: data.project_id,
    name: data.name,
    position: data.position,
    createdBy: data.created_by,
    deletedAt: data.deleted_at,
    tasks: data.tasks.filter(t => !t.deleted_at).map(mapTask),
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

const TASK_COMMENT_SELECT =
  "id, task_id, content, created_at, updated_at, user:profiles!task_comments_user_id_fkey(id, full_name, email)";

const taskCommentRowQuery = (supabase: Client) =>
  supabase.from("task_comments").select(TASK_COMMENT_SELECT);

type TaskCommentRow = QueryData<ReturnType<typeof taskCommentRowQuery>>[number];

const mapTaskComment = (c: TaskCommentRow) =>
  ({
    id: c.id,
    taskId: c.task_id,
    content: c.content,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    user: c.user
      ? { id: c.user.id, fullName: c.user.full_name, email: c.user.email }
      : null,
  }) satisfies TaskComment;

export const getTaskTimeline = cache(async (taskId: string) => {
  const { supabase } = await requireUserContext();

  const [{ data: events }, { data: comments }] = await Promise.all([
    supabase
      .from("task_events")
      .select(TASK_EVENT_SELECT)
      .eq("task_id", taskId),
    supabase
      .from("task_comments")
      .select(TASK_COMMENT_SELECT)
      .eq("task_id", taskId),
  ]);

  const items: TaskTimelineItem[] = [
    ...(events?.map(e => ({ kind: "event" as const, ...mapTaskEvent(e) })) ??
      []),
    ...(comments?.map(c => ({
      kind: "comment" as const,
      ...mapTaskComment(c),
    })) ?? []),
  ];

  items.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return items;
});

export const getMyTasks = cache(async (workspaceId: string) => {
  const { supabase, user } = await requireUserContext();

  const { data } = await supabase
    .from("tasks")
    .select(
      `${TASK_SELECT}, project:projects!inner(name, workspace_id, deleted_at)`,
    )
    .eq("assignee_id", user.id)
    .eq("project.workspace_id", workspaceId)
    .is("project.deleted_at", null)
    .is("deleted_at", null)
    .not("status", "in", `(${TASK_STATUSES.DONE},${TASK_STATUSES.CANCELLED})`)
    .order("due_date", { ascending: true, nullsFirst: false });

  const rows = data ?? [];
  const listIds = [...new Set(rows.map(t => t.list_id))];

  const { data: trashedLists } =
    listIds.length > 0
      ? await supabase
          .from("task_lists")
          .select("id")
          .in("id", listIds)
          .not("deleted_at", "is", null)
      : { data: [] };

  const trashedListIds = new Set((trashedLists ?? []).map(l => l.id));

  return rows
    .filter(t => !trashedListIds.has(t.list_id))
    .map(
      ({ project, ...t }) =>
        ({
          ...mapTask(t),
          projectName: project.name,
        }) satisfies MyTask,
    );
});
