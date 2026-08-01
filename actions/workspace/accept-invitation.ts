"use server";

import { ERRORS, LINKS } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import { generateInvitationRoute } from "@/utils/helpers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function acceptInvitationAction(token: string) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: invitation, error: fetchError } = await supabase
    .from("workspace_invitations")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (fetchError) return { error: ERRORS.SERVER_ERROR };
  if (!invitation) return { error: ERRORS.INVITATION_NOT_FOUND };

  if (new Date(invitation.expires_at) < new Date()) {
    return { error: ERRORS.INVITATION_EXPIRED };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .eq("email", invitation.email)
    .single();

  if (profileError) return { error: ERRORS.SERVER_ERROR };
  if (!profile) return { error: ERRORS.INVITATION_EMAIL_MISMATCH };

  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({
      id: user.id,
      workspace_id: invitation.workspace_id,
      role: invitation.role!,
      invited_by_id: invitation.invited_by_id,
      joined_at: new Date().toISOString(),
    });

  if (memberError) return { error: ERRORS.SERVER_ERROR };

  const { error: statusError } = await supabase
    .from("workspace_invitations")
    .update({ status: "accepted" })
    .eq("id", invitation.id);

  if (statusError) return { error: ERRORS.SERVER_ERROR };

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("link", generateInvitationRoute(token));

  revalidatePath(LINKS.TEAM);
  revalidatePath(LINKS.PROFILE_WORKSPACES);

  redirect(LINKS.PROFILE_WORKSPACES);
}
