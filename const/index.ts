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
  profileSettings: "/app/profile/settings",
  profileWorkspaces: "/app/profile/workspaces",
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
} as const;

export const VALIDATION_MAX = {
  FULL_NAME: 100,
  WORKSPACE_NAME: 100,
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
