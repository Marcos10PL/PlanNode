"use server";

import { ERRORS, LINKS } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type FavoritePositionChange = { id: string; position: number };

export async function reorderFavoriteProjectsAction(
  changes: FavoritePositionChange[],
) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const results = await Promise.all(
    changes.map(({ id, position }) =>
      supabase
        .from("project_favorites")
        .update({ position })
        .eq("project_id", id)
        .eq("user_id", user.id),
    ),
  );

  if (results.some(r => r.error)) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(LINKS.PROJECTS);
  revalidatePath(LINKS.PROJECTS_FAVORITES);
  return { success: true };
}
