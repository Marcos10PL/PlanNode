import { Notification } from "@/types/entities";
import { cache } from "react";
import { createClient } from "../supabase/server";

export const getNotifications = cache(async (): Promise<Notification[]> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  return data || [];
});

export const getUnreadNotificationsCount = cache(async (): Promise<number> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .is("read_at", null);

  return count ?? 0;
});
