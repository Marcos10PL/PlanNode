"use server";

import { ERRORS, LINKS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function acceptInvitationAction(token: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.unauthorized };

  const { data: invitation, error: fetchError } = await supabase
    .from("workspace_invitations")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (fetchError) return { error: ERRORS.serverError };
  if (!invitation) return { error: ERRORS.invitationNotFound };

  if (new Date(invitation.expires_at) < new Date()) {
    return { error: ERRORS.invitationExpired };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .eq("email", invitation.email)
    .single();

  if (profileError) return { error: ERRORS.serverError };
  if (!profile) return { error: ERRORS.invitationEmailMismatch };

  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({
      id: user.id,
      workspace_id: invitation.workspace_id,
      role: invitation.role,
      invited_by_id: invitation.invited_by_id,
      joined_at: new Date().toISOString(),
    });

  if (memberError) return { error: ERRORS.serverError };

  const { error: statusError } = await supabase
    .from("workspace_invitations")
    .update({ status: "accepted" })
    .eq("id", invitation.id);

  if (statusError) return { error: ERRORS.serverError };

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("link", `/invite/${token}`);

  revalidatePath(LINKS.team);
  revalidatePath(LINKS.profileWorkspaces);

  redirect(LINKS.dashboard);
}
