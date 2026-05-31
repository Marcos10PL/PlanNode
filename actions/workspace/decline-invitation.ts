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

  const { data: invitation } = await supabase
    .from("workspace_invitations")
    .select("id, email, expires_at")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (!invitation) return { error: ERRORS.invitationNotFound };

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  if (profile?.email !== invitation.email) {
    return { error: ERRORS.invitationEmailMismatch };
  }

  await supabase
    .from("workspace_invitations")
    .update({ status: "declined" })
    .eq("id", invitation.id);

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("link", `/invite/${token}`);

  revalidatePath(LINKS.notifications);

  redirect(LINKS.notifications);
}
