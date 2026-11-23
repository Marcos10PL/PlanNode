import { INVITATION_STATUSES, MANAGER_ROLES } from "@/const";
import { InvitationDetails, WorkspaceInvitation } from "@/types/dto";
import { cache } from "react";
import { createClient, requireUserContext } from "../supabase/server";

export const getInvitationByToken = cache(async (token: string) => {
  const supabase = await createClient();

  const { data } = await supabase
    .from("workspace_invitations")
    .select(
      "*, workspace:workspaces(name), inviter:profiles!invited_by_id(full_name)",
    )
    .eq("token", token)
    .eq("status", INVITATION_STATUSES.PENDING)
    .single();

  if (!data) return null;

  return {
    id: data.id,
    email: data.email,
    role: data.role,
    expiresAt: data.expires_at,
    workspaceName: data.workspace?.name ?? null,
    inviterName: data.inviter?.full_name ?? null,
  } satisfies InvitationDetails;
});

export const getWorkspaceInvitations = cache(async (workspaceId: string) => {
  const { supabase, user } = await requireUserContext();

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("id", user.id)
    .single();

  if (!membership || !MANAGER_ROLES.includes(membership.role)) return [];

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
