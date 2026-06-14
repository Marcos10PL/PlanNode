"use server";

import { ERRORS, LINKS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteNotificationAction(
  opts: { id: string } | { deleteAll: true },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const query =
    "deleteAll" in opts
      ? supabase.from("notifications").delete().eq("user_id", user.id)
      : supabase
          .from("notifications")
          .delete()
          .eq("id", opts.id)
          .eq("user_id", user.id);

  const { error } = await query;

  if (error) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(LINKS.NOTIFICATIONS);
  return { success: true };
}
