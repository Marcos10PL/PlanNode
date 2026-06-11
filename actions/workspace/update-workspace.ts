"use server";

import { ERRORS, LINKS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { updateWorkspaceSchema, UpdateWorkspaceSchema } from "@/schema";
import { revalidatePath } from "next/cache";

export async function updateWorkspaceAction(
  workspaceId: string,
  data: UpdateWorkspaceSchema,
) {
  const parsed = updateWorkspaceSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.invalidData };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.unauthorized };

  const { data: updated, error } = await supabase
    .from("workspaces")
    .update({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    })
    .eq("id", workspaceId)
    .eq("owner_id", user.id)
    .select("id")
    .single();

  if (error) return { error: ERRORS.serverError };
  if (!updated) return { error: ERRORS.unauthorized };

  revalidatePath(LINKS.profileWorkspaces);

  return { success: true };
}
