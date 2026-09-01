import { LINKS } from "@/const";
import { WorkspaceMember } from "@/types/dto";
import { redirect } from "next/navigation";
import { cache } from "react";
import { requireUserContext } from "../supabase/server";

export const getWorkspaceMembers = cache(async (workspaceId: string) => {
  const { supabase, user } = await requireUserContext();

  const { data: members } = await supabase
    .from("workspace_members")
    .select("id, workspace_id, role, invited_by_id, joined_at, invited_at")
    .eq("workspace_id", workspaceId)
    .order("joined_at", { ascending: true });

  if (!members?.some(m => m.id === user.id)) redirect(LINKS.DASHBOARD);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in(
      "id",
      members.map(m => m.id),
    );

  const profileMap = new Map(profiles?.map(p => [p.id, p]) ?? []);

  return (
    members.map(
      m =>
        ({
          id: m.id,
          role: m.role,
          fullName: profileMap.get(m.id)!.full_name,
          email: profileMap.get(m.id)!.email,
        }) satisfies WorkspaceMember,
    ) ?? []
  );
});
