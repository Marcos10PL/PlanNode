"use server";

import {
  EMAIL_TEMPLATES,
  ERRORS,
  LINKS,
  NOTIFICATION_TYPES,
  WORKSPACE_ROLES,
} from "@/const";
import { getAppConfig } from "@/lib/data/app-config";
import { getUserContext } from "@/lib/supabase/server";
import { renderLocalizedEmailTemplate, sendEmail } from "@/utils/email";
import { generateAbsoluteUrl } from "@/utils/helpers";
import { getRoleLabel } from "@/utils/workspace";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";

export async function transferOwnershipAction(
  workspaceId: string,
  newOwnerId: string,
) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: callerMember, error: callerError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("id", user.id)
    .single();

  if (callerError) return { error: ERRORS.SERVER_ERROR };
  if (!callerMember || callerMember.role !== WORKSPACE_ROLES.OWNER) {
    return { error: ERRORS.INSUFFICIENT_ROLE };
  }

  if (newOwnerId === user.id) return { error: ERRORS.INVALID_DATA };

  const [{ data: ownedCount, error: countError }, { maxWorkspacesPerUser }] =
    await Promise.all([
      supabase.rpc("get_owned_workspace_count", { p_user_id: newOwnerId }),
      getAppConfig(),
    ]);

  if (countError) return { error: ERRORS.SERVER_ERROR };
  if ((ownedCount ?? 0) >= maxWorkspacesPerUser) {
    return { error: ERRORS.WORKSPACE_LIMIT_REACHED };
  }

  const { error } = await supabase.rpc("transfer_workspace_ownership", {
    p_workspace_id: workspaceId,
    p_new_owner_id: newOwnerId,
  });

  if (error?.message.includes("workspace_limit_reached")) {
    return { error: ERRORS.WORKSPACE_LIMIT_REACHED };
  }
  if (error) return { error: ERRORS.SERVER_ERROR };

  const [{ data: workspace }, { data: callerProfile }, { data: newOwnerProfile }] =
    await Promise.all([
      supabase.from("workspaces").select("name").eq("id", workspaceId).single(),
      supabase.from("profiles").select("full_name").eq("id", user.id).single(),
      supabase
        .from("profiles")
        .select("email, locale")
        .eq("id", newOwnerId)
        .single(),
    ]);

  if (workspace && callerProfile) {
    const { error: notificationError } = await supabase.rpc(
      "create_notification",
      {
        p_user_id: newOwnerId,
        p_type: NOTIFICATION_TYPES.WORKSPACE_ROLE_CHANGED,
        p_metadata: {
          workspaceName: workspace.name,
          changedById: user.id,
          newRole: WORKSPACE_ROLES.OWNER,
        },
        p_link: LINKS.TEAM,
      },
    );
    if (notificationError) {
      console.error(
        "[transfer-ownership] Notification error:",
        notificationError,
      );
    }

    if (newOwnerProfile) {
      try {
        const { data: emailEnabled, error: emailPrefError } =
          await supabase.rpc("get_email_notification_enabled", {
            p_user_id: newOwnerId,
            p_type: NOTIFICATION_TYPES.WORKSPACE_ROLE_CHANGED,
          });
        if (emailPrefError) {
          console.error(
            "[transfer-ownership] Email preference check error:",
            emailPrefError,
          );
        }

        if (emailEnabled ?? true) {
          const t = await getTranslations({ locale: newOwnerProfile.locale });
          const { subject, html } = await renderLocalizedEmailTemplate(
            EMAIL_TEMPLATES.WORKSPACE_ROLE_CHANGED,
            newOwnerProfile.locale,
            {
              workspaceName: workspace.name,
              changedByName: callerProfile.full_name,
              newRole: getRoleLabel(WORKSPACE_ROLES.OWNER, t),
              teamUrl: generateAbsoluteUrl(LINKS.TEAM),
            },
          );
          await sendEmail(newOwnerProfile.email, subject, html);
        }
      } catch (e) {
        console.error("[transfer-ownership] Email error:", e);
      }
    }
  }

  revalidatePath(LINKS.TEAM);
  revalidatePath(LINKS.PROFILE_WORKSPACES);
  return { success: true };
}
