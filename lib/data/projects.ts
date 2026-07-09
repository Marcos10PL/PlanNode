import { LINKS, TASK_STATUSES } from "@/const";
import { Project, ProjectWithProgress } from "@/types/dto";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "../supabase/server";

export const getProjects = cache(async (workspaceId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(LINKS.LOGIN);

  const { data } = await supabase
    .from("projects")
    .select("id, workspace_id, name, description, is_private, created_by, tasks(status)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  return (
    data?.map(
      ({ tasks, ...p }) =>
        ({
          id: p.id,
          workspaceId: p.workspace_id,
          name: p.name,
          description: p.description,
          isPrivate: p.is_private,
          createdBy: p.created_by,
          totalTasks: tasks.length,
          doneTasks: tasks.filter(t => t.status === TASK_STATUSES.DONE).length,
          cancelledTasks: tasks.filter(t => t.status === TASK_STATUSES.CANCELLED)
            .length,
        }) satisfies ProjectWithProgress,
    ) ?? []
  );
});

export const getProject = cache(async (projectId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(LINKS.LOGIN);

  const { data } = await supabase
    .from("projects")
    .select("id, workspace_id, name, description, is_private, created_by")
    .eq("id", projectId)
    .maybeSingle();

  if (!data) return null;

  return {
    id: data.id,
    workspaceId: data.workspace_id,
    name: data.name,
    description: data.description,
    isPrivate: data.is_private,
    createdBy: data.created_by,
  } satisfies Project;
});

export const getProjectMemberIds = cache(async (projectId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(LINKS.LOGIN);

  const { data } = await supabase
    .from("project_members")
    .select("id")
    .eq("project_id", projectId);

  return data?.map(m => m.id) ?? [];
});
