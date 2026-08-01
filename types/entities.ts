import { Database } from "./supabase";

type Table<T extends TableName> = Database["public"]["Tables"][T]["Row"];

type Enum<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

export type TableName = keyof Database["public"]["Tables"];

export type UserRole = Enum<"user_role">;
export type WorkspaceRole = Enum<"workspace_role">;
export type InvitationStatus = Enum<"invitation_status">;
export type NotificationType = Enum<"notification_type">;
export type TaskStatus = Enum<"task_status">;
export type TaskPriority = Enum<"task_priority">;

export type WorkspaceTable = Table<"workspaces">;
export type AppConfigTable = Table<"app_config">;
export type ProfileTable = Table<"profiles">;
export type WorkspaceMemberTable = Table<"workspace_members">;
export type WorkspaceInvitationTable = Table<"workspace_invitations">;
export type NotificationTable = Table<"notifications">;
export type ProjectTable = Table<"projects">;
export type ProjectMemberTable = Table<"project_members">;
export type TaskListTable = Table<"task_lists">;
export type TaskTable = Table<"tasks">;
export type TaskEventTable = Table<"task_events">;
