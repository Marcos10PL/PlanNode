"use server";

import { ERRORS, INVITATION_STATUSES, LINKS, MANAGER_ROLES } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function revokeInvitationAction(invitationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: invitation, error: invitationError } = await supabase
    .from("workspace_invitations")
    .select("workspace_id")
    .eq("id", invitationId)
    .eq("status", INVITATION_STATUSES.PENDING)
    .single();

  if (invitationError) return { error: ERRORS.SERVER_ERROR };
  if (!invitation) return { error: ERRORS.INVITATION_NOT_FOUND };

  const { data: callerMember, error: callerMemberError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", invitation.workspace_id)
    .eq("id", user.id)
    .single();

  if (callerMemberError) return { error: ERRORS.SERVER_ERROR };

  if (!callerMember || !MANAGER_ROLES.includes(callerMember.role)) {
    return { error: ERRORS.INSUFFICIENT_ROLE };
  }

  const { error: deleteError } = await supabase
    .from("workspace_invitations")
    .delete()
    .eq("id", invitationId);

  if (deleteError) return { error: ERRORS.SERVER_ERROR };

  await supabase.rpc("delete_invitation_notification", {
    p_invitation_id: invitationId,
  });

  revalidatePath(LINKS.TEAM);
  return { success: true };
}
