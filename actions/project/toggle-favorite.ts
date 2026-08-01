"use server";

import { ERRORS, LINKS } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleProjectFavoriteAction(
  projectId: string,
  isFavorite: boolean,
) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  let error;

  if (isFavorite) {
    const { data: lastFavorite } = await supabase
      .from("project_favorites")
      .select("position")
      .eq("user_id", user.id)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    ({ error } = await supabase.from("project_favorites").insert({
      project_id: projectId,
      user_id: user.id,
      position: (lastFavorite?.position ?? -1) + 1,
    }));
  } else {
    ({ error } = await supabase
      .from("project_favorites")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", user.id));
  }

  if (error) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(LINKS.PROJECTS);
  revalidatePath(LINKS.PROJECTS_FAVORITES);
  return { success: true };
}
