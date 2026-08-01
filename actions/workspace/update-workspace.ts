"use server";

import { ERRORS, LINKS } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import { updateWorkspaceSchema, UpdateWorkspaceSchema } from "@/schema";
import { revalidatePath } from "next/cache";

export async function updateWorkspaceAction(
  workspaceId: string,
  data: UpdateWorkspaceSchema,
) {
  const parsed = updateWorkspaceSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

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

  if (error) return { error: ERRORS.SERVER_ERROR };
  if (!updated) return { error: ERRORS.UNAUTHORIZED };

  revalidatePath(LINKS.PROFILE_WORKSPACES);

  return { success: true };
}
