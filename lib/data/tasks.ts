import { TASK_STATUSES } from "@/const";
import { MyTask, Task, TaskListWithTasks } from "@/types/dto";
import { cache } from "react";
import { requireUserContext } from "../supabase/server";

const TASK_SELECT =
  "id, project_id, list_id, title, description, status, priority, assignee_id, due_date, position, created_by, assignee:profiles!tasks_assignee_id_fkey(id, full_name, email)";

type TaskRow = {
  id: string;
  project_id: string;
  list_id: string;
  title: string;
  description: string | null;
  status: Task["status"];
  priority: Task["priority"];
  assignee_id: string | null;
  due_date: string | null;
  position: number;
  created_by: string | null;
  assignee: { id: string; full_name: string; email: string } | null;
};

const mapTask = (t: TaskRow) =>
  ({
    id: t.id,
    projectId: t.project_id,
    listId: t.list_id,
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

export const getMyTasks = cache(async (workspaceId: string) => {
  const { supabase, user } = await requireUserContext();

  const { data } = await supabase
    .from("tasks")
    .select(`${TASK_SELECT}, project:projects!inner(name, workspace_id)`)
    .eq("assignee_id", user.id)
    .eq("project.workspace_id", workspaceId)
    .not(
      "status",
      "in",
      `(${TASK_STATUSES.DONE},${TASK_STATUSES.CANCELLED})`,
    )
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
