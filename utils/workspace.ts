import { WORKSPACE_ROLES } from "@/const";
import { Translations } from "@/types";
import { WorkspaceRole } from "@/types/entities";

export function getRoleLabel(role: WorkspaceRole, t: Translations) {
  const map: Record<WorkspaceRole, string> = {
    [WORKSPACE_ROLES.OWNER]: t("team.role_owner"),
    [WORKSPACE_ROLES.ADMIN]: t("team.role_admin"),
    [WORKSPACE_ROLES.MEMBER]: t("team.role_member"),
    [WORKSPACE_ROLES.GUEST]: t("team.role_guest"),
  };

  return map[role];
}

const ROLE_VARIANT: Record<WorkspaceRole, "default" | "secondary" | "outline"> =
  {
    [WORKSPACE_ROLES.OWNER]: "default",
    [WORKSPACE_ROLES.ADMIN]: "secondary",
    [WORKSPACE_ROLES.MEMBER]: "outline",
    [WORKSPACE_ROLES.GUEST]: "outline",
  };

export function getRoleVariant(role: WorkspaceRole) {
  return ROLE_VARIANT[role];
}
