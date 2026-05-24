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

  const { data: workspace, error: fetchError } = await supabase
    .from("workspaces")
    .select("owner_id")
    .eq("id", workspaceId)
    .single();

  if (fetchError || !workspace) return { error: ERRORS.serverError };
  if (workspace.owner_id !== user.id) return { error: ERRORS.unauthorized };

  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId);

  if (error) return { error: ERRORS.serverError };

  const cookieStore = await cookies();

  if (cookieStore.get(COOKIES.activeWorkspaceId)?.value === workspaceId) {
    cookieStore.delete(COOKIES.activeWorkspaceId);
  }

  revalidatePath(LINKS.profileWorkspaces);

  return { success: true };
}
