"use server";

import { ERRORS, LINKS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteProjectAction(projectId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { error: deleteError } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (deleteError) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(LINKS.PROJECTS);
  return { success: true };
}
