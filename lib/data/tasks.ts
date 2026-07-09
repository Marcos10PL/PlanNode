import { LINKS, TASK_STATUSES } from "@/const";
import { MyTask, Task, TaskListWithTasks } from "@/types/dto";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "../supabase/server";

export const getTaskLists = cache(async (projectId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(LINKS.LOGIN);

  const { data } = await supabase
    .from("task_lists")
    .select(
      "id, project_id, name, position, tasks(id, project_id, list_id, title, description, status, priority, assignee_id, due_date, position, created_by, assignee:profiles!tasks_assignee_id_fkey(id, full_name, email))",
    )
    .eq("project_id", projectId)
    .order("position", { ascending: true })
    .order("position", { referencedTable: "tasks", ascending: true });

  return (
    data?.map(
      list =>
        ({
          id: list.id,
          projectId: list.project_id,
          name: list.name,
          position: list.position,
          tasks: list.tasks.map(
            t =>
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
              }) satisfies Task,
          ),
        }) satisfies TaskListWithTasks,
    ) ?? []
  );
});

export const getMyTasks = cache(async (workspaceId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(LINKS.LOGIN);

  const { data } = await supabase
    .from("tasks")
    .select(
      "id, project_id, list_id, title, description, status, priority, assignee_id, due_date, position, created_by, project:projects!inner(name, workspace_id)",
    )
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
          assignee: null,
          projectName: project.name,
        }) satisfies MyTask,
    ) ?? []
  );
});
