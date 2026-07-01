import { INVITATION_STATUSES, LINKS, MANAGER_ROLES } from "@/const";
import { InvitationDetails, WorkspaceInvitation } from "@/types/dto";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "../supabase/server";

export const getInvitationByToken = cache(async (token: string) => {
  const supabase = await createClient();

  const { data } = await supabase
    .from("workspace_invitations")
    .select("*, workspace:workspaces(name)")
    .eq("token", token)
    .eq("status", INVITATION_STATUSES.PENDING)
    .single();

  if (!data) return null;

  const { data: inviter } = data.invited_by_id
    ? await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", data.invited_by_id)
        .single()
    : { data: null };

  return {
    id: data.id,
    email: data.email,
    role: data.role,
    expiresAt: data.expires_at,
    workspaceName: data.workspace?.name ?? null,
    inviterName: inviter?.full_name ?? null,
  } satisfies InvitationDetails;
});

export const getWorkspaceInvitations = cache(async (workspaceId: string) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(LINKS.LOGIN);

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
