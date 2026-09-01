import { COOKIES } from "@/const";
import { Workspace } from "@/types/dto";
import { cookies } from "next/headers";
import { cache } from "react";
import { Client, requireUserContext } from "../supabase/server";

export const getWorkspaces = cache(async () => {
  const { supabase, user } = await requireUserContext();

  const { data } = await supabase
    .from("workspaces")
    .select("*, workspace_members!inner(id), members:workspace_members(count)")
    .eq("workspace_members.id", user.id)
    .order("created_at", { ascending: true });

  const cleanData = data?.map(({ workspace_members: _, ...w }) => w) ?? [];

  return cleanData.map(
    w =>
      ({
        id: w.id,
        name: w.name,
        description: w.description,
        ownerId: w.owner_id,
        memberCount: w.members[0]?.count ?? 0,
      }) satisfies Workspace,
  );
});

export async function findOwnedWorkspacesWithOtherMembers(
  supabase: Client,
  userId: string,
): Promise<{ id: string; name: string }[]> {
  const { data } = await supabase
    .from("workspaces")
    .select("id, name, members:workspace_members(count)")
    .eq("owner_id", userId);

  return (data ?? [])
    .filter(w => (w.members[0]?.count ?? 0) > 1)
    .map(w => ({ id: w.id, name: w.name }));
}

export const getOwnedWorkspacesWithOtherMembers = cache(async () => {
  const { supabase, user } = await requireUserContext();
  return findOwnedWorkspacesWithOtherMembers(supabase, user.id);
});

export const getActiveWorkspaceId = cache(async () => {
  const cookieStore = await cookies();
  const cookieWorkspaceId =
    cookieStore.get(COOKIES.ACTIVE_WORKSPACE_ID)?.value ?? null;

  const workspaces = await getWorkspaces();

  return (
    workspaces.find(w => w.id === cookieWorkspaceId)?.id ??
    workspaces[0]?.id ??
    null
  );
});
