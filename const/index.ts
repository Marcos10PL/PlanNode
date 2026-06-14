import { InvitationStatus, UserRole, WorkspaceRole } from "@/types/entities";

export const LINKS = {
  HOME: "/",

  LOGIN: "/auth/login",
  SIGN_UP: "/auth/sign-up",
  FORGOT_PASSWORD: "/auth/forgot-password",
  UPDATE_PASSWORD: "/auth/update-password",
  SIGN_UP_SUCCESS: "/auth/sign-up-success",
  AUTH_ERROR: "/auth/error",

  APP: "/app",
  DASHBOARD: "/app/dashboard",
  PROFILE_SETTINGS: "/app/settings/profile",
  PROFILE_WORKSPACES: "/app/settings/workspaces",
  TEAM: "/app/settings/team",
  NOTIFICATIONS: "/app/notifications",
} as const;

export const USER_ROLES: Record<string, UserRole> = {
  ADMIN: "admin",
  USER: "user",
} as const;

export const ERRORS = {
  UNAUTHENTICATED: "unauthenticated",
  UNAUTHORIZED: "unauthorized",
  INVALID_DATA: "invalid_data",
  SERVER_ERROR: "server_error",
  SAME_PASSWORD: "same_password",
  WORKSPACE_LIMIT_REACHED: "workspace_limit_reached",
  INVALID_CREDENTIALS: "invalid_credentials",
  EMAIL_NOT_CONFIRMED: "email_not_confirmed",
  USER_ALREADY_EXISTS: "user_already_exists",
  INVITATION_NOT_FOUND: "invitation_not_found",
  INVITATION_EXPIRED: "invitation_expired",
  INVITATION_EMAIL_MISMATCH: "invitation_email_mismatch",
  ALREADY_MEMBER: "already_member",
  INSUFFICIENT_ROLE: "insufficient_role",
  CANNOT_REMOVE_OWNER: "cannot_remove_owner",
  CANNOT_LEAVE_AS_OWNER: "cannot_leave_as_owner",
} as const;

export const VALIDATION_MAX = {
  FULL_NAME: 100,
  WORKSPACE_NAME: 50,
  WORKSPACE_DESCRIPTION: 500,
} as const;

export const COOKIES = {
  ACTIVE_WORKSPACE_ID: "active_workspace_id",
} as const;

export const WORKSPACE_ROLES: Record<string, WorkspaceRole> = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
  GUEST: "guest",
} as const;

export const INVITABLE_ROLES = [
  WORKSPACE_ROLES.ADMIN,
  WORKSPACE_ROLES.MEMBER,
  WORKSPACE_ROLES.GUEST,
] as const;

export const MANAGER_ROLES = [
  WORKSPACE_ROLES.OWNER,
  WORKSPACE_ROLES.ADMIN,
] as const;

export const INVITATION_STATUSES: Record<string, InvitationStatus> = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
} as const;

export const EMAIL_TEMPLATES = {
  WORKSPACE_INVITATION: "workspace_invitation",
} as const;

export const NOTIFICATION_TYPES = {
  WORKSPACE_INVITATION: "workspace_invitation",
} as const;

export const APP_CONFIG_KEYS = {
  MAX_WORKSPACES_PER_USER: "max_workspaces_per_user",
} as const;
