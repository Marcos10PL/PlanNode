"use server";

import { ERRORS, LINKS, MANAGER_ROLES, WORKSPACE_ROLES } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function removeMemberAction(
  workspaceId: string,
  memberId: string,
) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: callerMember, error: callerMemberError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("id", user.id)
    .single();

  if (callerMemberError) return { error: ERRORS.SERVER_ERROR };

  if (!callerMember || !MANAGER_ROLES.includes(callerMember.role)) {
    return { error: ERRORS.INSUFFICIENT_ROLE };
  }

  const { data: targetMember, error: targetMemberError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("id", memberId)
    .single();

  if (targetMemberError) return { error: ERRORS.SERVER_ERROR };

  if (targetMember?.role === WORKSPACE_ROLES.OWNER) {
    return { error: ERRORS.CANNOT_REMOVE_OWNER };
  }

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", memberId);

  if (error) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(LINKS.TEAM);
  return { success: true };
}
