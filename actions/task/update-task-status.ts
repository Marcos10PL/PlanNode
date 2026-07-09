"use server";

import { ERRORS, LINKS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { updateTaskStatusSchema, UpdateTaskStatusSchema } from "@/schema";
import { generateProjectRoute } from "@/utils/helpers";
import { revalidatePath } from "next/cache";

export async function updateTaskStatusAction(
  taskId: string,
  data: UpdateTaskStatusSchema,
) {
  const parsed = updateTaskStatusSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: task, error: updateError } = await supabase
    .from("tasks")
    .update({ status: parsed.data.status })
    .eq("id", taskId)
    .select("project_id")
    .single();

  if (updateError || !task) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(generateProjectRoute(task.project_id));
  revalidatePath(LINKS.DASHBOARD);
  return { success: true };
}
