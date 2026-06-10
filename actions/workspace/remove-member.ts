"use server";

import { ERRORS, LINKS, MANAGER_ROLES, WORKSPACE_ROLES } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function removeMemberAction(
  workspaceId: string,
  memberId: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.unauthorized };

  const { data: callerMember } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("id", user.id)
    .single();

  if (!callerMember || !MANAGER_ROLES.includes(callerMember.role as never)) {
    return { error: ERRORS.insufficientRole };
  }

  const { data: targetMember } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("id", memberId)
    .single();

  if (targetMember?.role === WORKSPACE_ROLES.OWNER) {
    return { error: ERRORS.cannotRemoveOwner };
  }

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", memberId);

  if (error) return { error: ERRORS.serverError };

  revalidatePath(LINKS.team);
  return { success: true };
}
