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

  if (!user) return { error: ERRORS.unauthorized };

  if ("deleteAll" in opts) {
    await supabase.from("notifications").delete().eq("user_id", user.id);
  } else {
    await supabase
      .from("notifications")
      .delete()
      .eq("id", opts.id)
      .eq("user_id", user.id);
  }

  revalidatePath(LINKS.notifications);
  return { success: true };
}
