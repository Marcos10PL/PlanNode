export const LINKS = {
  home: "/",

  login: "/auth/login",
  signUp: "/auth/sign-up",
  forgotPassword: "/auth/forgot-password",
  updatePassword: "/auth/update-password",
  signUpSuccess: "/auth/sign-up-success",
  authError: "/auth/error",

  app: "/app",
  dashboard: "/app/dashboard",
  profileSettings: "/app/settings/profile",
  profileWorkspaces: "/app/settings/workspaces",
  team: "/app/settings/team",
  notifications: "/app/notifications",
} as const;

export const USER_ROLES = {
  admin: "admin",
  user: "user",
} as const;

export const ERRORS = {
  unauthorized: "unauthorized",
  invalidData: "invalid_data",
  serverError: "server_error",
  samePassword: "same_password",
  workspaceLimitReached: "workspace_limit_reached",
  invalidCredentials: "invalid_credentials",
  emailNotConfirmed: "email_not_confirmed",
  userAlreadyExists: "user_already_exists",
  invitationNotFound: "invitation_not_found",
  invitationExpired: "invitation_expired",
  invitationEmailMismatch: "invitation_email_mismatch",
  alreadyMember: "already_member",
  insufficientRole: "insufficient_role",
  cannotRemoveOwner: "cannot_remove_owner",
  cannotLeaveAsOwner: "cannot_leave_as_owner",
} as const;

export const VALIDATION_MAX = {
  FULL_NAME: 100,
  WORKSPACE_NAME: 50,
  WORKSPACE_DESCRIPTION: 500,
} as const;

export const COOKIES = {
  activeWorkspaceId: "active_workspace_id",
} as const;

export const WORKSPACE_ROLES = {
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

export const INVITATION_STATUSES = {
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
