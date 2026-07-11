import { TASK_STATUSES } from "@/const";
import { Project, ProjectWithProgress } from "@/types/dto";
import { cache } from "react";
import { requireUserContext } from "../supabase/server";

export const getProjects = cache(async (workspaceId: string) => {
  const { supabase } = await requireUserContext();

  const { data } = await supabase
    .from("projects")
    .select(
      "id, workspace_id, name, description, is_private, icon, color, created_by, task_lists(id, name, position, tasks(status))",
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true })
    .order("position", { referencedTable: "task_lists", ascending: true });

  return (
    data?.map(({ task_lists, ...p }) => {
      const tasks = task_lists.flatMap(list => list.tasks);

      return {
        id: p.id,
        workspaceId: p.workspace_id,
        name: p.name,
        description: p.description,
        isPrivate: p.is_private,
        icon: p.icon,
        color: p.color,
        createdBy: p.created_by,
        totalTasks: tasks.length,
        doneTasks: tasks.filter(t => t.status === TASK_STATUSES.DONE).length,
        cancelledTasks: tasks.filter(t => t.status === TASK_STATUSES.CANCELLED)
          .length,
        lists: task_lists.map(list => ({
          id: list.id,
          name: list.name,
          taskCount: list.tasks.length,
          doneCount: list.tasks.filter(t => t.status === TASK_STATUSES.DONE)
            .length,
          cancelledCount: list.tasks.filter(
            t => t.status === TASK_STATUSES.CANCELLED,
          ).length,
        })),
      } satisfies ProjectWithProgress;
    }) ?? []
  );
});

export const getProject = cache(async (projectId: string) => {
  const { supabase } = await requireUserContext();

  const { data } = await supabase
    .from("projects")
    .select(
      "id, workspace_id, name, description, is_private, icon, color, created_by",
    )
    .eq("id", projectId)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    workspaceId: data.workspace_id,
    name: data.name,
    description: data.description,
    isPrivate: data.is_private,
    icon: data.icon,
    color: data.color,
    createdBy: data.created_by,
  } satisfies Project;
});

export const getProjectMemberIds = cache(async (projectId: string) => {
  const { supabase } = await requireUserContext();

  const { data } = await supabase
    .from("project_members")
    .select("id")
    .eq("project_id", projectId);

  return data?.map(m => m.id) ?? [];
});
