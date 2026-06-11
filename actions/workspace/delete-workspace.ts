"use server";

import { COOKIES, ERRORS, LINKS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function deleteWorkspaceAction(workspaceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.unauthorized };

  const { data: deleted, error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId)
    .eq("owner_id", user.id)
    .select("id")
    .single();

  if (error) return { error: ERRORS.serverError };
  if (!deleted) return { error: ERRORS.unauthorized };

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
