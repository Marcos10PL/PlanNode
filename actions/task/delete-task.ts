"use server";

import { ERRORS, LINKS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { generateProjectRoute } from "@/utils/helpers";
import { revalidatePath } from "next/cache";

export async function deleteTaskAction(taskId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
