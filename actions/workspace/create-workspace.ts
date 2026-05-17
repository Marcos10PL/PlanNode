"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { createWorkspaceSchema, CreateWorkspaceSchema } from "@/schema";
import { ERRORS, LINKS } from "@/const";

export async function createWorkspaceAction(data: CreateWorkspaceSchema) {
  const parsed = createWorkspaceSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.invalidData };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.unauthorized };

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
