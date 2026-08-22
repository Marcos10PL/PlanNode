"use server";

import { getTaskTimeline } from "@/lib/data/tasks";

export async function getTaskTimelineAction(taskId: string) {
  const items = await getTaskTimeline(taskId);
  return { items };
}
