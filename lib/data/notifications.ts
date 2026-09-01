import { NOTIFICATION_TYPES, NOTIFICATIONS_PAGE_SIZE } from "@/const";
import { Notification, NotificationPreference } from "@/types/dto";
import { getTranslations } from "next-intl/server";
import { cache } from "react";
import { requireUserContext, resolveProfilesByIds } from "../supabase/server";

const ACTOR_KEYS: Partial<
  Record<Notification["type"], { id: string; name: string }>
> = {
  [NOTIFICATION_TYPES.WORKSPACE_INVITATION]: {
    id: "inviterId",
    name: "inviterName",
  },
  [NOTIFICATION_TYPES.TASK_ASSIGNED]: {
    id: "assignerId",
    name: "assignerName",
  },
  [NOTIFICATION_TYPES.PROJECT_MEMBER_ADDED]: {
    id: "addedById",
    name: "addedByName",
  },
  [NOTIFICATION_TYPES.TASK_COMMENT_ADDED]: {
    id: "commenterId",
    name: "commenterName",
  },
  [NOTIFICATION_TYPES.WORKSPACE_ROLE_CHANGED]: {
    id: "changedById",
    name: "changedByName",
  },
};

export const getNotifications = cache(
  async (offset = 0, limit: number = NOTIFICATIONS_PAGE_SIZE) => {
    const { supabase, user } = await requireUserContext();

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit);

    const hasMore = (data?.length ?? 0) > limit;
    const rows = hasMore ? (data?.slice(0, limit) ?? []) : (data ?? []);

    const actorIds = rows.map(n => {
      const keys = ACTOR_KEYS[n.type];
      const metadata = n.metadata as Record<string, unknown> | null;
      return keys ? (metadata?.[keys.id] as string | undefined) : undefined;
    });
    const [profileMap, tTasksActivity] = await Promise.all([
      resolveProfilesByIds(supabase, actorIds),
      getTranslations("tasks.activity"),
    ]);
    const unknownUserLabel = tTasksActivity("unknown_user");

    const notifications = rows.map(n => {
      const keys = ACTOR_KEYS[n.type];
      const metadata = n.metadata as Record<string, unknown> | null;

      const hasActorId = !!keys && !!metadata && keys.id in metadata;
      const actorProfile = hasActorId
        ? profileMap.get(metadata![keys!.id] as string)
        : undefined;
      const resolvedMetadata = hasActorId
        ? {
            ...metadata,
            [keys!.name]: actorProfile?.full_name ?? unknownUserLabel,
            actorEmail: actorProfile?.email ?? null,
            actorDeleted: !actorProfile,
          }
        : metadata;

      return {
        id: n.id,
        type: n.type,
        metadata: resolvedMetadata as Notification["metadata"],
        link: n.link,
        readAt: n.read_at,
        createdAt: n.created_at,
      } satisfies Notification;
    });

    return { notifications, hasMore };
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
