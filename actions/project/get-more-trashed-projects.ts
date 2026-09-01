"use server";

import { TrashSort } from "@/const";
import { getTrashedProjects } from "@/lib/data";

export async function getMoreTrashedProjectsAction(
  workspaceId: string,
  sort: TrashSort,
  offset: number,
) {
  return getTrashedProjects(workspaceId, sort, offset);
}
