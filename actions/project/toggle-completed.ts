"use server";

import { ERRORS, LINKS } from "@/const";
import { canEditProject, getUserContext } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleProjectCompletedAction(
  projectId: string,
  isCompleted: boolean,
) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  if (!(await canEditProject(supabase, projectId, user.id)))
    return { error: ERRORS.INSUFFICIENT_ROLE };

  const { error } = await supabase
    .from("projects")
    .update({ is_completed: isCompleted })
    .eq("id", projectId);

  if (error) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(LINKS.PROJECTS);
  revalidatePath(LINKS.PROJECTS_COMPLETED);
  return { success: true };
}
