"use server";

import { ERRORS, LINKS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function declineInvitationAction(token: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: ERRORS.unauthorized };

  const { data: invitation, error: fetchError } = await supabase
    .from("workspace_invitations")
    .select("id, email")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (fetchError) return { error: ERRORS.serverError };
  if (!invitation) return { error: ERRORS.invitationNotFound };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .eq("email", invitation.email)
    .single();

  if (profileError) return { error: ERRORS.serverError };
  if (!profile) return { error: ERRORS.invitationEmailMismatch };

  const { error: statusError } = await supabase
    .from("workspace_invitations")
    .update({ status: "declined" })
    .eq("id", invitation.id);

  if (statusError) return { error: ERRORS.serverError };

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("link", `/invite/${token}`);

  revalidatePath(LINKS.notifications);

  redirect(LINKS.notifications);
}
