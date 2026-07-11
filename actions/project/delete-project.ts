"use server";

import { ERRORS, LINKS } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteProjectAction(projectId: string) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { error: deleteError } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (deleteError) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(LINKS.PROJECTS);
  return { success: true };
}
