"use server";

import { getNotifications } from "@/lib/data";

export async function getMoreNotificationsAction(offset: number) {
  return getNotifications(offset);
}
