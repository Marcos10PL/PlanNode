import { WORKSPACE_ROLES } from "@/const";
import { Translations } from "@/types";
import { WorkspaceRole } from "@/types/entities";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const ROLE_LABEL_KEYS = {
  [WORKSPACE_ROLES.OWNER]: "team.role_owner",
  [WORKSPACE_ROLES.ADMIN]: "team.role_admin",
  [WORKSPACE_ROLES.MEMBER]: "team.role_member",
  [WORKSPACE_ROLES.GUEST]: "team.role_guest",
} as const satisfies Record<WorkspaceRole, string>;

const ROLE_VARIANT_MAP = {
  [WORKSPACE_ROLES.OWNER]: "destructive",
  [WORKSPACE_ROLES.ADMIN]: "default",
  [WORKSPACE_ROLES.MEMBER]: "secondary",
  [WORKSPACE_ROLES.GUEST]: "outline",
} as const satisfies Record<WorkspaceRole, BadgeVariant>;

export const getRoleLabel = (role: WorkspaceRole, t: Translations) =>
  t(ROLE_LABEL_KEYS[role]);

export const getRoleVariant = (role: WorkspaceRole) => ROLE_VARIANT_MAP[role];
