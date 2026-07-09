"use server";

import { ERRORS, LINKS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { updateProjectSchema, UpdateProjectSchema } from "@/schema";
import { generateProjectRoute } from "@/utils/helpers";
import { revalidatePath } from "next/cache";

export async function updateProjectAction(
  projectId: string,
  data: UpdateProjectSchema,
) {
  const parsed = updateProjectSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { name, description, isPrivate } = parsed.data;

  const { error: updateError } = await supabase
    .from("projects")
    .update({
      name,
      description: description || null,
      is_private: isPrivate,
    })
    .eq("id", projectId);

  if (updateError) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(LINKS.PROJECTS);
  revalidatePath(generateProjectRoute(projectId));
  return { success: true };
}
