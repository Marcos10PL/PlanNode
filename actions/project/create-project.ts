"use server";

import { ERRORS, LINKS, WORKSPACE_ROLES } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import { createProjectSchema, CreateProjectSchema } from "@/schema";
import { revalidatePath } from "next/cache";

export async function createProjectAction(
  workspaceId: string,
  data: CreateProjectSchema,
) {
  const parsed = createProjectSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: role } = await supabase.rpc("get_workspace_member_role", {
    p_workspace_id: workspaceId,
    p_user_id: user.id,
  });

  if (!role || role === WORKSPACE_ROLES.GUEST)
    return { error: ERRORS.INSUFFICIENT_ROLE };

  const { name, description, isPrivate, icon, color } = parsed.data;

  const { data: project, error: insertError } = await supabase
    .from("projects")
    .insert({
      workspace_id: workspaceId,
      name,
      description: description || null,
      is_private: isPrivate,
      icon,
      color,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (insertError || !project) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(LINKS.PROJECTS);
  return { success: true, projectId: project.id };
}
