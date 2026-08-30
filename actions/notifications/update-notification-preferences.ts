"use server";

import { ERRORS, LINKS } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import {
  updateNotificationPreferencesSchema,
  UpdateNotificationPreferencesSchema,
} from "@/schema";
import { revalidatePath } from "next/cache";

export async function updateNotificationPreferencesAction(
  data: UpdateNotificationPreferencesSchema,
) {
  const parsed = updateNotificationPreferencesSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { error } = await supabase.from("notification_preferences").upsert(
    parsed.data.preferences.map(p => ({
      user_id: user.id,
      type: p.type,
      email_enabled: p.emailEnabled,
      in_app_enabled: p.inAppEnabled,
    })),
    { onConflict: "user_id,type" },
  );

  if (error) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(LINKS.NOTIFICATIONS);
  return { success: true };
}
