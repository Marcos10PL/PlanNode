"use server";

import { ERRORS, LINKS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { createWorkspaceSchema, CreateWorkspaceSchema } from "@/schema";
import { revalidatePath } from "next/cache";

export async function createWorkspaceAction(data: CreateWorkspaceSchema) {
  const parsed = createWorkspaceSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.invalidData };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.unauthorized };

  const [{ count }, { data: configRow }] = await Promise.all([
    supabase
      .from("workspaces")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", user.id),
    supabase
      .from("app_config")
      .select("value")
      .eq("key", "max_workspaces_per_user")
      .single(),
  ]);

  const limit = configRow?.value ?? 15;
  if ((count ?? 0) >= limit) return { error: ERRORS.workspaceLimitReached };

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .insert({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      owner_id: user.id,
    })
    .select("*")
    .single();

  if (error) return { error: ERRORS.serverError };

  revalidatePath(LINKS.profileWorkspaces);

  return { success: true, workspace };
}
