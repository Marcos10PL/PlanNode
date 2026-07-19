"use server";

import { ERRORS, LINKS } from "@/const";
import { canEditProject, getUserContext } from "@/lib/supabase/server";
import { updateProjectSchema, UpdateProjectSchema } from "@/schema";
import { generateProjectRoute } from "@/utils/helpers";
import { revalidatePath } from "next/cache";

export async function updateProjectAction(
  projectId: string,
  data: UpdateProjectSchema,
) {
  const parsed = updateProjectSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  if (!(await canEditProject(supabase, projectId, user.id)))
    return { error: ERRORS.INSUFFICIENT_ROLE };

  const { name, description, isPrivate, icon, color } = parsed.data;

  const { error: updateError } = await supabase
    .from("projects")
    .update({
      name,
      description: description || null,
      is_private: isPrivate,
      icon,
      color,
    })
    .eq("id", projectId);

  if (updateError) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(LINKS.PROJECTS);
  revalidatePath(generateProjectRoute(projectId));
  return { success: true };
}
