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
