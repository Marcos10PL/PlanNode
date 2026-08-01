import { MANAGER_ROLES, WORKSPACE_ROLES } from "@/const";
import { cache } from "react";
import { requireUserContext } from "../supabase/server";
import { getWorkspaceMembers } from "./members";

export const getWorkspaceContext = cache(async (workspaceId: string) => {
  const { user } = await requireUserContext();
  const members = await getWorkspaceMembers(workspaceId);

  const currentMember = members.find(m => m.id === user.id);
  const role = currentMember?.role ?? WORKSPACE_ROLES.GUEST;

  return {
    user,
    members,
    role,
    canEdit: !!currentMember && role !== WORKSPACE_ROLES.GUEST,
    canManage: MANAGER_ROLES.includes(role),
  };
});
