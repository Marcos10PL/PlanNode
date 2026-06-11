"use server";

import { COOKIES, ERRORS, LINKS, WORKSPACE_ROLES } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function leaveWorkspaceAction(workspaceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: ERRORS.unauthorized };

  const { data: member, error: memberError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("id", user.id)
    .single();

  if (memberError) return { error: ERRORS.serverError };
  if (!member) return { error: ERRORS.unauthorized };

  if (member.role === WORKSPACE_ROLES.OWNER) {
    return { error: ERRORS.cannotLeaveAsOwner };
  }

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", user.id);

  if (error) return { error: ERRORS.serverError };

  const cookieStore = await cookies();

  if (cookieStore.get(COOKIES.activeWorkspaceId)?.value === workspaceId) {
    const { data: other } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("id", user.id)
      .neq("workspace_id", workspaceId)
      .single();

    if (other) {
      cookieStore.set(COOKIES.activeWorkspaceId, other.workspace_id);
    } else {
      cookieStore.delete(COOKIES.activeWorkspaceId);
    }
  }

  revalidatePath(LINKS.profileWorkspaces);
  return { success: true };
}
