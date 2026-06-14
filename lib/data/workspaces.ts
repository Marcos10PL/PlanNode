import { Workspace } from "@/types/dto";
import { cache } from "react";
import { createClient } from "../supabase/server";

export const getWorkspaces = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthenticated");

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
