"use server";

import { ERRORS, LINKS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { createProjectSchema, CreateProjectSchema } from "@/schema";
import { revalidatePath } from "next/cache";

export async function createProjectAction(
  workspaceId: string,
  data: CreateProjectSchema,
) {
  const parsed = createProjectSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { name, description, isPrivate } = parsed.data;

  const { data: project, error: insertError } = await supabase
    .from("projects")
    .insert({
      workspace_id: workspaceId,
      name,
      description: description || null,
      is_private: isPrivate,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (insertError || !project) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(LINKS.PROJECTS);
  return { success: true, projectId: project.id };
}
