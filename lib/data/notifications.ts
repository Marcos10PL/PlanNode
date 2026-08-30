import { NOTIFICATION_TYPES, NOTIFICATIONS_PAGE_SIZE } from "@/const";
import { Notification, NotificationPreference } from "@/types/dto";
import { cache } from "react";
import { requireUserContext } from "../supabase/server";

export const getNotifications = cache(
  async (offset = 0, limit: number = NOTIFICATIONS_PAGE_SIZE) => {
    const { supabase, user } = await requireUserContext();

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const notifications =
      data?.map(
        n =>
          ({
            id: n.id,
            type: n.type,
            metadata: n.metadata as Notification["metadata"],
            link: n.link,
            readAt: n.read_at,
            createdAt: n.created_at,
          }) satisfies Notification,
      ) ?? [];

    return { notifications, hasMore: notifications.length === limit };
  },
);

export const getUnreadNotificationsCount = cache(async () => {
  const { supabase, user } = await requireUserContext();

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  return count ?? 0;
});

export const getNotificationsCount = cache(async () => {
  const { supabase, user } = await requireUserContext();

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  return count ?? 0;
});

export const getNotificationPreferences = cache(async () => {
  const { supabase, user } = await requireUserContext();

  const { data } = await supabase
    .from("notification_preferences")
    .select("type, email_enabled, in_app_enabled")
    .eq("user_id", user.id);

  const byType = new Map((data ?? []).map(p => [p.type, p]));

  return Object.values(NOTIFICATION_TYPES).map(type => {
    const pref = byType.get(type);
    return {
      type,
      emailEnabled: pref?.email_enabled ?? true,
      inAppEnabled: pref?.in_app_enabled ?? true,
    } satisfies NotificationPreference;
  });
});
