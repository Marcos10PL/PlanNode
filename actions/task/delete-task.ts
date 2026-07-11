"use server";

import { ERRORS, LINKS } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import { generateProjectRoute } from "@/utils/helpers";
import { revalidatePath } from "next/cache";

export async function deleteTaskAction(taskId: string) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("project_id")
    .eq("id", taskId)
    .single();

  if (fetchError || !task) return { error: ERRORS.SERVER_ERROR };

  const { error: deleteError } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  if (deleteError) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(generateProjectRoute(task.project_id));
  revalidatePath(LINKS.DASHBOARD);
  return { success: true };
}
