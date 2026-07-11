"use server";

import { COOKIES, ERRORS, LINKS } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function deleteWorkspaceAction(workspaceId: string) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: deleted, error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId)
    .eq("owner_id", user.id)
    .select("id")
    .single();

  if (error) return { error: ERRORS.SERVER_ERROR };
  if (!deleted) return { error: ERRORS.UNAUTHORIZED };

  const cookieStore = await cookies();

  if (cookieStore.get(COOKIES.ACTIVE_WORKSPACE_ID)?.value === workspaceId) {
    const { data: other } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("id", user.id)
      .neq("workspace_id", workspaceId)
      .single();

    if (other) {
      cookieStore.set(COOKIES.ACTIVE_WORKSPACE_ID, other.workspace_id);
    } else {
      cookieStore.delete(COOKIES.ACTIVE_WORKSPACE_ID);
    }
  }

  revalidatePath(LINKS.PROFILE_WORKSPACES);

  return { success: true };
}
