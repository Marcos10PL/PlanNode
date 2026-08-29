import { TASK_STATUSES } from "@/const";
import { Project, ProjectWithProgress } from "@/types/dto";
import type { QueryData } from "@supabase/supabase-js";
import { cache } from "react";
import { Client, requireUserContext } from "../supabase/server";

const PROJECT_BASE_FIELDS =
  "id, workspace_id, name, description, is_private, is_completed, icon, color, created_by, created_at, task_lists(id, name, position, tasks(status, parent_task_id))";

const projectRowQuery = (supabase: Client) =>
  supabase
    .from("projects")
    .select(`${PROJECT_BASE_FIELDS}, project_favorites(position)`);

const mapProjectWithProgress = (
  row: QueryData<ReturnType<typeof projectRowQuery>>[number],
): ProjectWithProgress => {
  // Subtasks have their own independent status, so a parent being marked
  // done doesn't say anything about them — excluded from these counts so
  // progress reflects top-level tasks only.
  const topLevelTasksByList = row.task_lists.map(list =>
    list.tasks.filter(t => !t.parent_task_id),
  );
  const tasks = topLevelTasksByList.flat();
  const favorite = row.project_favorites[0] as { position: number } | undefined;

  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    description: row.description,
    isPrivate: row.is_private,
    isCompleted: row.is_completed,
    icon: row.icon,
    color: row.color,
    createdBy: row.created_by,
    createdAt: row.created_at,
    isFavorite: !!favorite,
    favoritePosition: favorite?.position ?? null,
    totalTasks: tasks.length,
    doneTasks: tasks.filter(t => t.status === TASK_STATUSES.DONE).length,
    cancelledTasks: tasks.filter(t => t.status === TASK_STATUSES.CANCELLED)
      .length,
    lists: row.task_lists.map((list, index) => {
      const listTasks = topLevelTasksByList[index];
      return {
        id: list.id,
        name: list.name,
        taskCount: listTasks.length,
        doneCount: listTasks.filter(t => t.status === TASK_STATUSES.DONE)
          .length,
        cancelledCount: listTasks.filter(
          t => t.status === TASK_STATUSES.CANCELLED,
        ).length,
      };
    }),
  } satisfies ProjectWithProgress;
};

export const getProjects = cache(async (workspaceId: string) => {
  const { supabase, user } = await requireUserContext();

  const { data } = await supabase
    .from("projects")
    .select(`${PROJECT_BASE_FIELDS}, project_favorites(position)`)
    .eq("workspace_id", workspaceId)
    .eq("project_favorites.user_id", user.id)
    .order("position", { ascending: true })
    .order("position", { referencedTable: "task_lists", ascending: true });

  return data?.map(mapProjectWithProgress) ?? [];
});

export const getActiveProjects = cache(async (workspaceId: string) => {
  const { supabase, user } = await requireUserContext();

  const { data } = await supabase
    .from("projects")
    .select(`${PROJECT_BASE_FIELDS}, project_favorites(position)`)
    .eq("workspace_id", workspaceId)
    .eq("is_completed", false)
    .eq("project_favorites.user_id", user.id)
    .order("position", { ascending: true })
    .order("position", { referencedTable: "task_lists", ascending: true });

  return data?.map(mapProjectWithProgress) ?? [];
});

export const getCompletedProjects = cache(async (workspaceId: string) => {
  const { supabase, user } = await requireUserContext();

  const { data } = await supabase
    .from("projects")
    .select(`${PROJECT_BASE_FIELDS}, project_favorites(position)`)
    .eq("workspace_id", workspaceId)
    .eq("is_completed", true)
    .eq("project_favorites.user_id", user.id)
    .order("position", { ascending: true })
    .order("position", { referencedTable: "task_lists", ascending: true });

  return data?.map(mapProjectWithProgress) ?? [];
});

export const getFavoriteProjects = cache(async (workspaceId: string) => {
  const { supabase, user } = await requireUserContext();

  const { data } = await supabase
    .from("projects")
    .select(`${PROJECT_BASE_FIELDS}, project_favorites!inner(position)`)
    .eq("workspace_id", workspaceId)
    .eq("project_favorites.user_id", user.id)
    .order("position", {
      referencedTable: "project_favorites",
      ascending: true,
    })
    .order("position", { referencedTable: "task_lists", ascending: true });

  return data?.map(mapProjectWithProgress) ?? [];
});

export const getProject = cache(async (projectId: string) => {
  const { supabase, user } = await requireUserContext();

  const { data } = await supabase
    .from("projects")
    .select(
      "id, workspace_id, name, description, is_private, is_completed, icon, color, created_by, created_at, project_favorites(position)",
    )
    .eq("id", projectId)
    .eq("project_favorites.user_id", user.id)
    .maybeSingle();

  if (!data) return null;

  const { project_favorites, ...p } = data;

  return {
    id: p.id,
    workspaceId: p.workspace_id,
    name: p.name,
    description: p.description,
    isPrivate: p.is_private,
    isCompleted: p.is_completed,
    icon: p.icon,
    color: p.color,
    createdBy: p.created_by,
    createdAt: p.created_at,
    isFavorite: project_favorites.length > 0,
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
