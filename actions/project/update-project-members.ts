"use server";

import { EMAIL_TEMPLATES, ERRORS, NOTIFICATION_TYPES } from "@/const";
import { getUserContext, isProjectManager } from "@/lib/supabase/server";
import {
  updateProjectMembersSchema,
  UpdateProjectMembersSchema,
} from "@/schema";
import { renderLocalizedEmailTemplate, sendEmail } from "@/utils/email";
import { generateAbsoluteUrl, generateProjectRoute } from "@/utils/helpers";
import { revalidatePath } from "next/cache";

export async function updateProjectMembersAction(
  projectId: string,
  data: UpdateProjectMembersSchema,
) {
  const parsed = updateProjectMembersSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  if (!(await isProjectManager(supabase, projectId, user.id)))
    return { error: ERRORS.INSUFFICIENT_ROLE };

  const { data: currentMembers, error: fetchError } = await supabase
    .from("project_members")
    .select("id")
    .eq("project_id", projectId);

  if (fetchError) return { error: ERRORS.SERVER_ERROR };

  const currentIds = currentMembers.map(m => m.id);
  const { memberIds } = parsed.data;

  const toRemove = currentIds.filter(id => !memberIds.includes(id));
  const toAdd = memberIds.filter(id => !currentIds.includes(id));

  if (toRemove.length > 0) {
    const { error: removeError } = await supabase
      .from("project_members")
      .delete()
      .eq("project_id", projectId)
      .in("id", toRemove);

    if (removeError) return { error: ERRORS.SERVER_ERROR };
  }

  if (toAdd.length > 0) {
    const { error: addError } = await supabase.from("project_members").insert(
      toAdd.map(id => ({
        project_id: projectId,
        id,
        added_by_id: user.id,
      })),
    );

    if (addError) return { error: ERRORS.SERVER_ERROR };

    const notifiedIds = toAdd.filter(id => id !== user.id);

    if (notifiedIds.length > 0) {
      const [
        { data: project },
        { data: adderProfile },
        { data: addedProfiles },
      ] = await Promise.all([
        supabase
          .from("projects")
          .select("name, is_private")
          .eq("id", projectId)
          .single(),
        supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single(),
        supabase
          .from("profiles")
          .select("id, email, locale")
          .in("id", notifiedIds),
      ]);

      if (project?.is_private && adderProfile) {
        for (const memberProfile of addedProfiles ?? []) {
          await supabase.rpc("create_notification", {
            p_user_id: memberProfile.id,
            p_type: NOTIFICATION_TYPES.PROJECT_MEMBER_ADDED,
            p_metadata: {
              projectName: project.name,
              addedByName: adderProfile.full_name,
              projectId,
            },
            p_link: generateProjectRoute(projectId),
          });

          try {
            const { subject, html } = await renderLocalizedEmailTemplate(
              EMAIL_TEMPLATES.PROJECT_MEMBER_ADDED,
              memberProfile.locale,
              {
                projectName: project.name,
                addedByName: adderProfile.full_name,
                projectUrl: generateAbsoluteUrl(
                  generateProjectRoute(projectId),
                ),
              },
            );
            await sendEmail(memberProfile.email, subject, html);
          } catch (e) {
            console.error("[update-project-members] Email error:", e);
          }
        }
      }
    }
  }

  revalidatePath(generateProjectRoute(projectId));
  return { success: true };
}
