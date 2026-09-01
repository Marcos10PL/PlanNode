"use server";

import { getWorkspaceMembers } from "@/lib/data/members";

export async function getWorkspaceMembersAction(workspaceId: string) {
  return getWorkspaceMembers(workspaceId);
}
