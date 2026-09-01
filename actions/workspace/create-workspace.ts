"use server";

import { ERRORS, LINKS } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import { createWorkspaceSchema, CreateWorkspaceSchema } from "@/schema";
import { Workspace } from "@/types/dto";
import { revalidatePath } from "next/cache";

const MAX_WORKSPACES_PER_USER_FALLBACK = 15;

export async function createWorkspaceAction(data: CreateWorkspaceSchema) {
  const parsed = createWorkspaceSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const [{ count, error: countError }, { data: configRow }] = await Promise.all(
    [
      supabase
        .from("workspaces")
        .select("*", { count: "exact", head: true })
        .eq("owner_id", user.id),
      supabase
        .from("app_config")
        .select("value")
        .eq("key", "max_workspaces_per_user")
        .single(),
    ],
  );

  if (countError) return { error: ERRORS.SERVER_ERROR };

  const limit =
    Number(configRow?.value ?? 0) ?? MAX_WORKSPACES_PER_USER_FALLBACK;

  if ((count ?? 0) >= limit) return { error: ERRORS.WORKSPACE_LIMIT_REACHED };

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .insert({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      owner_id: user.id,
    })
    .select("*")
    .single();

  if (error) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(LINKS.PROFILE_WORKSPACES);

  return {
    success: true,
    workspace: {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      ownerId: workspace.owner_id,
      memberCount: 1,
    } satisfies Workspace,
  };
}
