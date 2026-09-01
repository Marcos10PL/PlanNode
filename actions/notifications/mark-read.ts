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

  const { error } =
    "markAll" in opts
      ? await supabase
          .from("notifications")
          .update({ read_at: readAt })
          .eq("user_id", user.id)
          .is("read_at", null)
      : await supabase
          .from("notifications")
          .update({ read_at: readAt })
          .eq("id", opts.id)
          .eq("user_id", user.id)
          .is("read_at", null);

  if (error) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(LINKS.NOTIFICATIONS);
  return { success: true };
}
