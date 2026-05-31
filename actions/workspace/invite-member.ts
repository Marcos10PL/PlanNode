"use server";

import {
  EMAIL_TEMPLATES,
  ERRORS,
  LINKS,
  NOTIFICATION_TYPES,
  WORKSPACE_ROLES,
} from "@/const";
import { renderEmailTemplate, sendEmail } from "@/utils/email";

import { createClient } from "@/lib/supabase/server";
import { inviteMemberSchema, InviteMemberSchema } from "@/schema";
import { revalidatePath } from "next/cache";

export async function inviteMemberAction(
  workspaceId: string,
  data: InviteMemberSchema,
) {
  const parsed = inviteMemberSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.invalidData };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.unauthorized };

  const { data: callerMember } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("id", user.id)
    .single();

  if (
    !callerMember ||
    ![WORKSPACE_ROLES.OWNER, WORKSPACE_ROLES.ADMIN].includes(
      callerMember.role as never,
    )
  ) {
    return { error: ERRORS.insufficientRole };
  }

  const { email, role } = parsed.data;

  const { data: invitedProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (invitedProfile) {
    const { data: existingMember } = await supabase
      .from("workspace_members")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("id", invitedProfile.id)
      .single();

    if (existingMember) return { error: ERRORS.alreadyMember };
  }

  const { data: existingInvitation } = await supabase
    .from("workspace_invitations")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("email", email)
    .eq("status", "pending")
    .single();

  if (existingInvitation) return { error: ERRORS.alreadyMember };

  const token = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { error: insertError } = await supabase
    .from("workspace_invitations")
    .insert({
      workspace_id: workspaceId,
      email,
      role,
      invited_by_id: user.id,
      token,
      expires_at: expiresAt,
    });

  if (insertError) return { error: ERRORS.serverError };

  const [{ data: workspace }, { data: callerProfile }] = await Promise.all([
    supabase.from("workspaces").select("name").eq("id", workspaceId).single(),
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
  ]);

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/invite/${token}`;

  if (invitedProfile) {
    await supabase.rpc("create_notification", {
      p_user_id: invitedProfile.id,
      p_type: NOTIFICATION_TYPES.WORKSPACE_INVITATION,
      p_title: `${callerProfile?.full_name ?? "Ktoś"} zaprasza Cię do "${workspace?.name ?? ""}"`,
      p_link: `/invite/${token}`,
    });
  }

  try {
    const { subject, html } = await renderEmailTemplate(
      EMAIL_TEMPLATES.WORKSPACE_INVITATION,
      {
        workspaceName: workspace?.name ?? "",
        invitedByName: callerProfile?.full_name ?? "",
        role,
        inviteUrl,
      },
    );
    await sendEmail(email, subject, html);
  } catch (e) {
    console.error("[invite-member] Email error:", e);
  }

  revalidatePath(LINKS.team);
  return { success: true };
}
