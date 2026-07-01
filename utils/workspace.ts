import { WORKSPACE_ROLES } from "@/const";
import { Translations } from "@/types";
import { WorkspaceRole } from "@/types/entities";

export const getRoleLabel = (role: WorkspaceRole, t: Translations) => {
  switch (role) {
    case WORKSPACE_ROLES.OWNER:
      return t("team.role_owner");
    case WORKSPACE_ROLES.ADMIN:
      return t("team.role_admin");
    case WORKSPACE_ROLES.MEMBER:
      return t("team.role_member");
    case WORKSPACE_ROLES.GUEST:
      return t("team.role_guest");
  }
};

export const getRoleVariant = (role: WorkspaceRole) => {
  switch (role) {
    case WORKSPACE_ROLES.OWNER:
      return "destructive";
    case WORKSPACE_ROLES.ADMIN:
      return "default";
    case WORKSPACE_ROLES.MEMBER:
      return "secondary";
    case WORKSPACE_ROLES.GUEST:
      return "outline";
  }
};
