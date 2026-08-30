"use server";

import {
  EMAIL_TEMPLATES,
  ERRORS,
  LINKS,
  MANAGER_ROLES,
  NOTIFICATION_TYPES,
} from "@/const";
import { renderLocalizedEmailTemplate, sendEmail } from "@/utils/email";

import { getUserContext } from "@/lib/supabase/server";
import { inviteMemberSchema, InviteMemberSchema } from "@/schema";
import {
  generateExpirationDate,
  generateInvitationLink,
  generateInvitationRoute,
} from "@/utils/helpers";
import { revalidatePath } from "next/cache";

export async function inviteMemberAction(
  workspaceId: string,
  data: InviteMemberSchema,
) {
  const parsed = inviteMemberSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: callerMember, error: callerMemberError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("id", user.id)
    .single();

  if (callerMemberError) return { error: ERRORS.SERVER_ERROR };

  if (!callerMember || !MANAGER_ROLES.includes(callerMember.role)) {
    return { error: ERRORS.INSUFFICIENT_ROLE };
  }

  const { email, role } = parsed.data;

  const { data: invitedProfile } = await supabase
    .from("profiles")
    .select("id, locale")
    .eq("email", email)
    .single();

  if (invitedProfile) {
    const { data: existingMember } = await supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("id", invitedProfile.id)
      .single();

    if (existingMember) return { error: ERRORS.ALREADY_MEMBER };
  }

  const { data: existingInvitation } = await supabase
    .from("workspace_invitations")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("email", email)
    .eq("status", "pending")
    .single();

  if (existingInvitation) return { error: ERRORS.ALREADY_MEMBER };

  const token = crypto.randomUUID();
  const expiresAt = generateExpirationDate(7);

  const { data: invitation, error: insertError } = await supabase
    .from("workspace_invitations")
    .insert({
      workspace_id: workspaceId,
      email,
      role,
      invited_by_id: user.id,
      token,
      expires_at: expiresAt,
    })
    .select("id")
    .single();

  if (insertError || !invitation) return { error: ERRORS.SERVER_ERROR };

  const [{ data: workspace }, { data: callerProfile }] = await Promise.all([
    supabase.from("workspaces").select("name").eq("id", workspaceId).single(),
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
  ]);

  if (!workspace || !callerProfile) return { error: ERRORS.SERVER_ERROR };

  if (invitedProfile) {
    await supabase.rpc("create_notification", {
      p_user_id: invitedProfile.id,
      p_type: NOTIFICATION_TYPES.WORKSPACE_INVITATION,
      p_metadata: {
        inviterName: callerProfile.full_name,
        workspaceName: workspace.name,
        invitationId: invitation.id,
      },
      p_link: generateInvitationRoute(token),
    });
  }

  let emailEnabled = true;
  if (invitedProfile) {
    const { data, error: emailPrefError } = await supabase.rpc(
      "get_email_notification_enabled",
      {
        p_user_id: invitedProfile.id,
        p_type: NOTIFICATION_TYPES.WORKSPACE_INVITATION,
      },
    );
    if (emailPrefError) {
      console.error(
        "[invite-member] Email preference check error:",
        emailPrefError,
      );
    }
    emailEnabled = data ?? true;
  }

  if (emailEnabled) {
    try {
      const { subject, html } = await renderLocalizedEmailTemplate(
        EMAIL_TEMPLATES.WORKSPACE_INVITATION,
        invitedProfile?.locale ?? "pl",
        {
          workspaceName: workspace.name,
          invitedByName: callerProfile.full_name,
          role,
          inviteUrl: generateInvitationLink(token),
        },
      );
      await sendEmail(email, subject, html);
    } catch (e) {
      console.error("[invite-member] Email error:", e);
    }
  }

  revalidatePath(LINKS.TEAM);
  return { success: true };
}
