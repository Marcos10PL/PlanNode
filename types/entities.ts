import { Database } from "./supabase";

type Table<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

type Enum<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

export type UserRole = Enum<"user_role">;
export type WorkspaceRole = Enum<"workspace_role">;
export type InvitationStatus = Enum<"invitation_status">;
export type NotificationType = Enum<"notification_type">;

export type WorkspaceTable = Table<"workspaces">;
export type AppConfigTable = Table<"app_config">;
export type ProfileTable = Table<"profiles">;
export type WorkspaceMemberTable = Table<"workspace_members">;
export type WorkspaceInvitationTable = Table<"workspace_invitations">;
export type NotificationTable = Table<"notifications">;
