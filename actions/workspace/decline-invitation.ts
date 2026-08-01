"use server";

import { ERRORS, LINKS } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import { generateInvitationRoute } from "@/utils/helpers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function declineInvitationAction(token: string) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: invitation, error: fetchError } = await supabase
    .from("workspace_invitations")
    .select("id, email")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (fetchError) return { error: ERRORS.SERVER_ERROR };
  if (!invitation) return { error: ERRORS.INVITATION_NOT_FOUND };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .eq("email", invitation.email)
    .single();

  if (profileError) return { error: ERRORS.SERVER_ERROR };
  if (!profile) return { error: ERRORS.INVITATION_EMAIL_MISMATCH };

  const { error: statusError } = await supabase
    .from("workspace_invitations")
    .update({ status: "declined" })
    .eq("id", invitation.id);

  if (statusError) return { error: ERRORS.SERVER_ERROR };

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("link", generateInvitationRoute(token));

  revalidatePath(LINKS.NOTIFICATIONS);

  redirect(LINKS.NOTIFICATIONS);
}
