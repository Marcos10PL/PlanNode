import {
  INVITATION_STATUSES,
  NOTIFICATION_TYPES,
  USER_ROLES,
  WORKSPACE_ROLES,
} from "@/const";

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type WorkspaceRole =
  (typeof WORKSPACE_ROLES)[keyof typeof WORKSPACE_ROLES];
export type InvitationStatus =
  (typeof INVITATION_STATUSES)[keyof typeof INVITATION_STATUSES];
export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export type Workspace = {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type AppConfig = {
  max_workspaces_per_user: number;
};

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  locale: "pl" | "en";
  created_at: string;
  updated_at: string;
};

export type WorkspaceMember = {
  id: string;
  workspace_id: string;
  role: WorkspaceRole;
  invited_by_id: string | null;
  joined_at: string | null;
  invited_at: string;
  profile: Pick<Profile, "full_name" | "email">;
};

export type WorkspaceInvitation = {
  id: string;
  workspace_id: string;
  email: string;
  role: WorkspaceRole;
  status: InvitationStatus;
  invited_by_id: string | null;
  token: string;
  expires_at: string;
  created_at: string;
  workspace?: Pick<Workspace, "id" | "name">;
};

export type WorkspaceInvitationMetadata = {
  inviterName: string;
  workspaceName: string;
  invitationId: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  metadata: WorkspaceInvitationMetadata | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};
