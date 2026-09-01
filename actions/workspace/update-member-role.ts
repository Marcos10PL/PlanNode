"use server";

import {
  EMAIL_TEMPLATES,
  ERRORS,
  LINKS,
  MANAGER_ROLES,
  NOTIFICATION_TYPES,
  WORKSPACE_ROLES,
} from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import { updateMemberRoleSchema, UpdateMemberRoleSchema } from "@/schema";
import { renderLocalizedEmailTemplate, sendEmail } from "@/utils/email";
import { generateAbsoluteUrl } from "@/utils/helpers";
import { getRoleLabel } from "@/utils/workspace";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";

export async function updateMemberRoleAction(
  workspaceId: string,
  memberId: string,
  data: UpdateMemberRoleSchema,
) {
  const parsed = updateMemberRoleSchema().safeParse(data);
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

  const { data: targetMember, error: targetMemberError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("id", memberId)
    .single();

  if (targetMemberError) return { error: ERRORS.SERVER_ERROR };

  if (targetMember?.role === WORKSPACE_ROLES.OWNER) {
    return { error: ERRORS.CANNOT_REMOVE_OWNER };
  }

  const { error } = await supabase
    .from("workspace_members")
    .update({ role: parsed.data.role })
    .eq("workspace_id", workspaceId)
    .eq("id", memberId);

  if (error) return { error: ERRORS.SERVER_ERROR };

  if (memberId !== user.id) {
    const [
      { data: workspace },
      { data: callerProfile },
      { data: targetProfile },
    ] = await Promise.all([
      supabase.from("workspaces").select("name").eq("id", workspaceId).single(),
      supabase.from("profiles").select("full_name").eq("id", user.id).single(),
      supabase
        .from("profiles")
        .select("email, locale")
        .eq("id", memberId)
        .single(),
    ]);

    if (workspace && callerProfile) {
      const { error: notificationError } = await supabase.rpc(
        "create_notification",
        {
          p_user_id: memberId,
          p_type: NOTIFICATION_TYPES.WORKSPACE_ROLE_CHANGED,
          p_metadata: {
            workspaceName: workspace.name,
            changedById: user.id,
            newRole: parsed.data.role,
          },
          p_link: LINKS.TEAM,
        },
      );
      if (notificationError) {
        console.error(
          "[update-member-role] Notification error:",
          notificationError,
        );
      }

      if (targetProfile) {
        try {
          const { data: emailEnabled, error: emailPrefError } =
            await supabase.rpc("get_email_notification_enabled", {
              p_user_id: memberId,
              p_type: NOTIFICATION_TYPES.WORKSPACE_ROLE_CHANGED,
            });
          if (emailPrefError) {
            console.error(
              "[update-member-role] Email preference check error:",
              emailPrefError,
            );
          }

          if (emailEnabled ?? true) {
            const t = await getTranslations({ locale: targetProfile.locale });
            const { subject, html } = await renderLocalizedEmailTemplate(
              EMAIL_TEMPLATES.WORKSPACE_ROLE_CHANGED,
              targetProfile.locale,
              {
                workspaceName: workspace.name,
                changedByName: callerProfile.full_name,
                newRole: getRoleLabel(parsed.data.role, t),
                teamUrl: generateAbsoluteUrl(LINKS.TEAM),
              },
            );
            await sendEmail(targetProfile.email, subject, html);
          }
        } catch (e) {
          console.error("[update-member-role] Email error:", e);
        }
      }
    }
  }

  revalidatePath(LINKS.TEAM);
  return { success: true };
}
