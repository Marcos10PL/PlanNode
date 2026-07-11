import { Notification } from "@/types/dto";
import { cache } from "react";
import { requireUserContext } from "../supabase/server";

export const getNotifications = cache(async () => {
  const { supabase, user } = await requireUserContext();

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
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
    ) ?? []
  );
});

export const getUnreadNotificationsCount = cache(async () => {
  const { supabase, user } = await requireUserContext();

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);

  return count ?? 0;
});
