import { COOKIES } from "@/const";
import { Workspace } from "@/types/dto";
import { cookies } from "next/headers";
import { cache } from "react";
import { requireUserContext } from "../supabase/server";

export const getWorkspaces = cache(async () => {
  const { supabase, user } = await requireUserContext();

  const { data } = await supabase
    .from("workspaces")
    .select("*, workspace_members!inner(id)")
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
      }) satisfies Workspace,
  );
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
