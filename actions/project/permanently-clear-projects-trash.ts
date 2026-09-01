"use server";

import { ERRORS, LINKS, MANAGER_ROLES } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function permanentlyClearProjectsTrashAction(
  workspaceId: string,
) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: role } = await supabase.rpc("get_workspace_member_role", {
    p_workspace_id: workspaceId,
    p_user_id: user.id,
  });

  if (!role || !MANAGER_ROLES.includes(role))
    return { error: ERRORS.INSUFFICIENT_ROLE };

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("workspace_id", workspaceId)
    .not("deleted_at", "is", null);

  if (error) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(LINKS.PROJECTS_TRASH);
  return { success: true };
}
