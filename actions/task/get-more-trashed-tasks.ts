"use server";

import { TrashSort } from "@/const";
import { getTrashedTasksInProject } from "@/lib/data";

export async function getMoreTrashedTasksAction(
  projectId: string,
  sort: TrashSort,
  offset: number,
) {
  return getTrashedTasksInProject(projectId, sort, offset);
}
