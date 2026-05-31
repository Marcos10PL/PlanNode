import { WorkspaceMember } from "@/types/entities";
import { cache } from "react";
import { createClient } from "../supabase/server";

export const getWorkspaceMembers = cache(
  async (workspaceId: string): Promise<WorkspaceMember[]> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: members } = await supabase
      .from("workspace_members")
      .select("id, workspace_id, role, invited_by_id, joined_at, invited_at")
      .eq("workspace_id", workspaceId)
      .order("joined_at", { ascending: true });

    if (!members?.length) return [];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in(
        "id",
        members.map(m => m.id),
      );

    const profileMap = new Map(profiles?.map(p => [p.id, p]) ?? []);

    return members.map(m => ({
      ...m,
      profile: profileMap.get(m.id),
    })) as WorkspaceMember[];
  },
);

export const getWorkspaceUserRole = cache(
  async (workspaceId: string): Promise<WorkspaceMember["role"] | null> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("id", user.id)
      .single();

    return data?.role ?? null;
  },
);
