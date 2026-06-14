import { INVITATION_STATUSES, MANAGER_ROLES } from "@/const";
import { WorkspaceInvitation } from "@/types/dto";
import { cache } from "react";
import { createClient } from "../supabase/server";

export const getWorkspaceInvitations = cache(async (workspaceId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthenticated");

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("id", user.id)
    .single();

  if (!membership || !MANAGER_ROLES.includes(membership.role))
    throw new Error("Unauthorized");

  const { data } = await supabase
    .from("workspace_invitations")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("status", INVITATION_STATUSES.PENDING)
    .order("created_at", { ascending: false });

  return (
    data?.map(
      i =>
        ({
          id: i.id,
          email: i.email,
          role: i.role,
        }) satisfies WorkspaceInvitation,
    ) ?? []
  );
});
