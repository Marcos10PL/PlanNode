"use server";

import { ERRORS, LINKS, WORKSPACE_ROLES } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import { createProjectSchema, CreateProjectSchema } from "@/schema";
import { getTranslations } from "next-intl/server";
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

  const { data: lastProject } = await supabase
    .from("projects")
    .select("position")
    .eq("workspace_id", workspaceId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const t = await getTranslations("common");

  const { data: projectId, error: insertError } = await supabase.rpc(
    "create_project_with_default_list",
    {
      p_workspace_id: workspaceId,
      p_name: name,
      p_description: description ?? null,
      p_is_private: isPrivate,
      p_icon: icon,
      p_color: color,
      p_position: (lastProject?.position ?? -1) + 1,
      p_list_name: t("default_list_name"),
    },
  );

  if (insertError || !projectId) {
    console.error("[create-project] RPC error:", insertError);
    return { error: ERRORS.SERVER_ERROR };
  }

  revalidatePath(LINKS.PROJECTS);
  return { success: true, projectId };
}
