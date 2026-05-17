import { cache } from "react";
import { Workspace } from "@/types/entities";
import { createClient } from "../supabase/server";

export const getWorkspaces = cache(async (): Promise<Workspace[]> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("workspaces")
    .select("*")
    .order("created_at", { ascending: true });

  return data ?? [];
});
