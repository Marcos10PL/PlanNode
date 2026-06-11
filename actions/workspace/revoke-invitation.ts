"use server";

import { ERRORS, LINKS, MANAGER_ROLES } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function revokeInvitationAction(invitationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.unauthorized };

  const { data: invitation, error: invitationError } = await supabase
    .from("workspace_invitations")
    .select("workspace_id")
    .eq("id", invitationId)
    .single();

  if (invitationError) return { error: ERRORS.serverError };
  if (!invitation) return { error: ERRORS.invitationNotFound };

  const { data: callerMember, error: callerMemberError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", invitation.workspace_id)
    .eq("id", user.id)
    .single();

  if (callerMemberError) return { error: ERRORS.serverError };

  if (!callerMember || !MANAGER_ROLES.includes(callerMember.role)) {
    return { error: ERRORS.insufficientRole };
  }

  const { error: deleteError } = await supabase
    .from("workspace_invitations")
    .delete()
    .eq("id", invitationId);

  if (deleteError) return { error: ERRORS.serverError };

  await supabase.rpc("delete_notification", { p_invitation_id: invitationId });

  revalidatePath(LINKS.team);
  return { success: true };
}
