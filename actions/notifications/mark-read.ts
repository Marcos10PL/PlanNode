"use server";

import { ERRORS, LINKS } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function markNotificationReadAction(
  opts: { id: string } | { markAll: true },
) {
  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const readAt = new Date().toISOString();

  if ("markAll" in opts) {
    await supabase
      .from("notifications")
      .update({ read_at: readAt })
      .eq("user_id", user.id)
      .is("read_at", null);
  } else {
    await supabase
      .from("notifications")
      .update({ read_at: readAt })
      .eq("id", opts.id)
      .eq("user_id", user.id)
      .is("read_at", null);
  }

  revalidatePath(LINKS.NOTIFICATIONS);
  return { success: true };
}
