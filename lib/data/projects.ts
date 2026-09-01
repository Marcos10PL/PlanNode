import {
  TASK_STATUSES,
  TRASH_PAGE_SIZE,
  TRASH_SORTS,
  TrashSort,
} from "@/const";
import {
  Project,
  ProjectWithProgress,
  TrashedTask,
  TrashedTaskList,
} from "@/types/dto";
import type { QueryData } from "@supabase/supabase-js";
import { cache } from "react";
import { Client, requireUserContext } from "../supabase/server";

const PROJECT_BASE_FIELDS =
  "id, workspace_id, name, description, is_private, is_completed, icon, color, created_by, created_at, deleted_at, task_lists(id, name, position, deleted_at, tasks(status, parent_task_id, deleted_at))";

const projectRowQuery = (supabase: Client) =>
  supabase
    .from("projects")
    .select(`${PROJECT_BASE_FIELDS}, project_favorites(position)`);

const mapProjectWithProgress = (
  row: QueryData<ReturnType<typeof projectRowQuery>>[number],
): ProjectWithProgress => {
  const visibleLists = row.task_lists.filter(list => !list.deleted_at);

  // subtask counts are not included in the progress counts
  const topLevelTasksByList = visibleLists.map(list =>
    list.tasks.filter(t => !t.parent_task_id && !t.deleted_at),
  );

  const tasks = topLevelTasksByList.flat();
  const favorite = row.project_favorites[0];

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
    deletedAt: row.deleted_at,
    isFavorite: !!favorite,
    favoritePosition: favorite?.position ?? null,
    totalTasks: tasks.length,
    doneTasks: tasks.filter(t => t.status === TASK_STATUSES.DONE).length,
    cancelledTasks: tasks.filter(t => t.status === TASK_STATUSES.CANCELLED)
      .length,
    lists: visibleLists.map((list, index) => {
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
    .is("deleted_at", null)
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
    .is("deleted_at", null)
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
    .is("deleted_at", null)
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
    .is("deleted_at", null)
    .eq("project_favorites.user_id", user.id)
    .order("position", {
      referencedTable: "project_favorites",
      ascending: true,
    })
    .order("position", { referencedTable: "task_lists", ascending: true });

  return data?.map(mapProjectWithProgress) ?? [];
});

export const getTrashedProjects = cache(
  async (
    workspaceId: string,
    sort: TrashSort = TRASH_SORTS.DELETED_NEWEST,
    offset = 0,
    limit: number = TRASH_PAGE_SIZE,
  ) => {
    const { supabase, user } = await requireUserContext();

    const base = supabase
      .from("projects")
      .select(`${PROJECT_BASE_FIELDS}, project_favorites(position)`)
      .eq("workspace_id", workspaceId)
      .not("deleted_at", "is", null)
      .eq("project_favorites.user_id", user.id);

    const ordered =
      sort === TRASH_SORTS.NAME
        ? base.order("name", { ascending: true })
        : base.order("deleted_at", {
            ascending: sort === TRASH_SORTS.DELETED_OLDEST,
          });

    const { data } = await ordered.range(offset, offset + limit);

    const hasMore = (data?.length ?? 0) > limit;
    const rows = hasMore ? (data ?? []).slice(0, limit) : (data ?? []);

    return { projects: rows.map(mapProjectWithProgress), hasMore };
  },
);

export const getProject = cache(async (projectId: string) => {
  const { supabase, user } = await requireUserContext();

  const { data } = await supabase
    .from("projects")
    .select(
      "id, workspace_id, name, description, is_private, is_completed, icon, color, created_by, created_at, deleted_at, project_favorites(position)",
    )
    .eq("id", projectId)
    .is("deleted_at", null)
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
    deletedAt: p.deleted_at,
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

export const getTrashedTaskLists = cache(
  async (
    projectId: string,
    sort: TrashSort = TRASH_SORTS.DELETED_NEWEST,
    offset = 0,
    limit: number = TRASH_PAGE_SIZE,
  ) => {
    const { supabase } = await requireUserContext();

    const base = supabase
      .from("task_lists")
      .select("id, project_id, name, created_by, deleted_at")
      .eq("project_id", projectId)
      .not("deleted_at", "is", null);

    const ordered =
      sort === TRASH_SORTS.NAME
        ? base.order("name", { ascending: true })
        : base.order("deleted_at", {
            ascending: sort === TRASH_SORTS.DELETED_OLDEST,
          });

    const { data } = await ordered.range(offset, offset + limit);

    const hasMore = (data?.length ?? 0) > limit;
    const rows = hasMore ? (data ?? []).slice(0, limit) : (data ?? []);

    return {
      lists: rows.map(
        l =>
          ({
            id: l.id,
            projectId: l.project_id,
            name: l.name,
            createdBy: l.created_by,
            deletedAt: l.deleted_at,
          }) satisfies TrashedTaskList,
      ),
      hasMore,
    };
  },
);

export const getTrashedTasksInProject = cache(
  async (
    projectId: string,
    sort: TrashSort = TRASH_SORTS.DELETED_NEWEST,
    offset = 0,
    limit: number = TRASH_PAGE_SIZE,
  ) => {
    const { supabase } = await requireUserContext();

    const { data: trashedTaskRows } = await supabase
      .from("tasks")
      .select("id")
      .eq("project_id", projectId)
      .not("deleted_at", "is", null);

    const trashedTaskIds = (trashedTaskRows ?? []).map(t => t.id);

    let base = supabase
      .from("tasks")
      .select(
        "id, project_id, list_id, parent_task_id, title, created_by, deleted_at, list:task_lists!inner(name, deleted_at)",
      )
      .eq("project_id", projectId)
      .not("deleted_at", "is", null)
      .is("list.deleted_at", null);

    if (trashedTaskIds.length > 0) {
      base = base.or(
        `parent_task_id.is.null,parent_task_id.not.in.(${trashedTaskIds.join(",")})`,
      );
    }

    const ordered =
      sort === TRASH_SORTS.NAME
        ? base.order("title", { ascending: true })
        : base.order("deleted_at", {
            ascending: sort === TRASH_SORTS.DELETED_OLDEST,
          });

    const { data } = await ordered.range(offset, offset + limit);

    const hasMore = (data?.length ?? 0) > limit;
    const rows = hasMore ? (data ?? []).slice(0, limit) : (data ?? []);

    const parentIds = [
      ...new Set(
        rows.map(t => t.parent_task_id).filter((id): id is string => !!id),
      ),
    ];

    const { data: parents } =
      parentIds.length > 0
        ? await supabase.from("tasks").select("id, title").in("id", parentIds)
        : { data: [] };

    const parentTitleById = new Map((parents ?? []).map(p => [p.id, p.title]));

    return {
      tasks: rows.map(
        t =>
          ({
            id: t.id,
            projectId: t.project_id,
            listId: t.list_id,
            listName: t.list.name,
            parentTaskId: t.parent_task_id,
            title: t.title,
            createdBy: t.created_by,
            deletedAt: t.deleted_at,
            parentTitle: t.parent_task_id
              ? (parentTitleById.get(t.parent_task_id) ?? null)
              : null,
          }) satisfies TrashedTask,
      ),
      hasMore,
    };
  },
);
