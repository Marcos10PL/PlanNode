"use server";

import { TrashSort } from "@/const";
import { getTrashedTaskLists } from "@/lib/data";

export async function getMoreTrashedTaskListsAction(
  projectId: string,
  sort: TrashSort,
  offset: number,
) {
  return getTrashedTaskLists(projectId, sort, offset);
}
