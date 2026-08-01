"use server";

import { ERRORS, LINKS, WORKSPACE_ROLES } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ProjectPositionChange = { id: string; position: number };

export async function reorderProjectsAction(
  workspaceId: string,
  changes: ProjectPositionChange[],
) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: role } = await supabase.rpc("get_workspace_member_role", {
    p_workspace_id: workspaceId,
    p_user_id: user.id,
  });

  if (!role || role === WORKSPACE_ROLES.GUEST)
    return { error: ERRORS.INSUFFICIENT_ROLE };

  const results = await Promise.all(
    changes.map(({ id, position }) =>
      supabase
        .from("projects")
        .update({ position })
        .eq("id", id)
        .eq("workspace_id", workspaceId),
    ),
  );

  if (results.some(r => r.error)) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(LINKS.PROJECTS);
  return { success: true };
}
