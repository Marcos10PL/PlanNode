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

  const { data: invitation } = await supabase
    .from("workspace_invitations")
    .select("workspace_id, token")
    .eq("id", invitationId)
    .single();

  if (!invitation) return { error: ERRORS.invitationNotFound };

  const { data: callerMember } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", invitation.workspace_id)
    .eq("id", user.id)
    .single();

  if (!callerMember || !MANAGER_ROLES.includes(callerMember.role as never)) {
    return { error: ERRORS.insufficientRole };
  }

  await supabase.from("workspace_invitations").delete().eq("id", invitationId);

  await supabase
    .from("notifications")
    .delete()
    .eq("link", `/invite/${invitation.token}`);

  revalidatePath(LINKS.team);
  return { success: true };
}
