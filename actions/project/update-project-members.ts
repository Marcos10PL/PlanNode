"use server";

import { ERRORS } from "@/const";
import { getUserContext, isProjectManager } from "@/lib/supabase/server";
import { updateProjectMembersSchema, UpdateProjectMembersSchema } from "@/schema";
import { generateProjectRoute } from "@/utils/helpers";
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
  }

  revalidatePath(generateProjectRoute(projectId));
  return { success: true };
}
