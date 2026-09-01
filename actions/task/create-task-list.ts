"use server";

import { ERRORS } from "@/const";
import { canEditProject, getUserContext } from "@/lib/supabase/server";
import { createTaskListSchema, CreateTaskListSchema } from "@/schema";
import { generateProjectRoute } from "@/utils/helpers";
import { revalidatePath } from "next/cache";

export async function createTaskListAction(
  projectId: string,
  data: CreateTaskListSchema,
) {
  const parsed = createTaskListSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  if (!(await canEditProject(supabase, projectId, user.id)))
    return { error: ERRORS.INSUFFICIENT_ROLE };

  const { data: lastList } = await supabase
    .from("task_lists")
    .select("position")
    .eq("project_id", projectId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error: insertError } = await supabase.from("task_lists").insert({
    project_id: projectId,
    name: parsed.data.name,
    position: (lastList?.position ?? -1) + 1,
    created_by: user.id,
  });

  if (insertError) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(generateProjectRoute(projectId));
  return { success: true };
}
