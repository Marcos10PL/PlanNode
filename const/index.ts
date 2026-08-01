import {
  InvitationStatus,
  TaskPriority,
  TaskStatus,
  UserRole,
  WorkspaceRole,
} from "@/types/entities";

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
  PROJECTS: "/app/projects",
  PROJECTS_FAVORITES: "/app/projects/favorites",
  PROJECTS_COMPLETED: "/app/projects/completed",
  PROFILE_SETTINGS: "/app/settings/profile",
  PROFILE_WORKSPACES: "/app/settings/workspaces",
  TEAM: "/app/settings/team",
  NOTIFICATIONS: "/app/notifications",
} as const;

export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const satisfies Record<string, UserRole>;

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
  PROJECT_NOT_FOUND: "project_not_found",
  INVALID_ASSIGNEE: "invalid_assignee",
  CANNOT_DELETE_LAST_LIST: "cannot_delete_last_list",
} as const;

export const VALIDATION_MAX = {
  FULL_NAME: 100,
  WORKSPACE_NAME: 50,
  WORKSPACE_DESCRIPTION: 500,
  PROJECT_NAME: 50,
  PROJECT_DESCRIPTION: 1500,
  TASK_LIST_NAME: 50,
  TASK_TITLE: 200,
  TASK_DESCRIPTION: 2000,
} as const;

export const COOKIES = {
  ACTIVE_WORKSPACE_ID: "active_workspace_id",
  SIDEBAR_STATE: "sidebar_state",
  PROJECT_SORT: "project_sort",
  PROJECT_SORT_FAVORITES: "project_sort_favorites",
  PROJECT_SORT_COMPLETED: "project_sort_completed",
  SIDEBAR_EXPANDED_PROJECTS: "sidebar_expanded_projects",
} as const;

export const WORKSPACE_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
  GUEST: "guest",
} as const satisfies Record<string, WorkspaceRole>;

export const INVITABLE_ROLES = [
  WORKSPACE_ROLES.ADMIN,
  WORKSPACE_ROLES.MEMBER,
  WORKSPACE_ROLES.GUEST,
] as const as readonly WorkspaceRole[];

export const MANAGER_ROLES = [
  WORKSPACE_ROLES.OWNER,
  WORKSPACE_ROLES.ADMIN,
] as const as readonly WorkspaceRole[];

export const INVITATION_STATUSES = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
} as const satisfies Record<string, InvitationStatus>;

export const EMAIL_TEMPLATES = {
  WORKSPACE_INVITATION: "workspace_invitation",
} as const;

export const NOTIFICATION_TYPES = {
  WORKSPACE_INVITATION: "workspace_invitation",
  TASK_ASSIGNED: "task_assigned",
} as const;

export const TASK_STATUSES = {
  ON_HOLD: "on_hold",
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  IN_REVIEW: "in_review",
  IN_TESTS: "in_tests",
  DONE: "done",
  CANCELLED: "cancelled",
} as const satisfies Record<string, TaskStatus>;

export const TASK_STATUS_ORDER: TaskStatus[] = [
  TASK_STATUSES.TODO,
  TASK_STATUSES.IN_PROGRESS,
  TASK_STATUSES.IN_REVIEW,
  TASK_STATUSES.IN_TESTS,
  TASK_STATUSES.DONE,
  TASK_STATUSES.ON_HOLD,
  TASK_STATUSES.CANCELLED,
];

export const TASK_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const satisfies Record<string, TaskPriority>;

export const PROJECT_SORTS = {
  CUSTOM: "custom",
  NEWEST: "newest",
  DATE: "date",
  NAME: "name",
  PROGRESS: "progress",
} as const;

export const TASK_SORTS = {
  DEFAULT: "default",
  DUE_DATE: "due_date",
  PRIORITY: "priority",
  NAME: "name",
} as const;

export const PROJECT_ICONS = {
  FOLDER_KANBAN: "folder-kanban",
  ROCKET: "rocket",
  LIGHTBULB: "lightbulb",
  BAR_CHART: "bar-chart",
  TARGET: "target",
  SHIELD: "shield",
  WRENCH: "wrench",
  BOOK: "book",
  GLOBE: "globe",
  HEART: "heart",
  ZAP: "zap",
  FLAG: "flag",
  BRIEFCASE: "briefcase",
  CALENDAR: "calendar",
  CODE: "code",
  PALETTE: "palette",
} as const;

export const PROJECT_COLORS = {
  NEUTRAL: "neutral",
  RED: "red",
  ORANGE: "orange",
  AMBER: "amber",
  YELLOW: "yellow",
  LIME: "lime",
  GREEN: "green",
  EMERALD: "emerald",
  TEAL: "teal",
  CYAN: "cyan",
  SKY: "sky",
  BLUE: "blue",
  INDIGO: "indigo",
  VIOLET: "violet",
  PURPLE: "purple",
  PINK: "pink",
} as const;

export const APP_CONFIG_KEYS = {
  MAX_WORKSPACES_PER_USER: "max_workspaces_per_user",
} as const;
