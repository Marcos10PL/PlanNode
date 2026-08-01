"use server";

import { getTaskEvents } from "@/lib/data/tasks";

export async function getTaskEventsAction(taskId: string) {
  const events = await getTaskEvents(taskId);
  return { events };
}
