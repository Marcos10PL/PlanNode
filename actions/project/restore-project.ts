"use server";

import { ERRORS, LINKS } from "@/const";
import { canEditProject, getUserContext } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function restoreProjectAction(projectId: string) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  if (!(await canEditProject(supabase, projectId, user.id)))
    return { error: ERRORS.INSUFFICIENT_ROLE };

  const { error: updateError } = await supabase
    .from("projects")
    .update({ deleted_at: null })
    .eq("id", projectId);

  if (updateError) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(LINKS.PROJECTS);
  revalidatePath(LINKS.PROJECTS_TRASH);
  return { success: true };
}
