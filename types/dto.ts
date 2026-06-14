import { APP_CONFIG_KEYS } from "@/const";
import {
  NotificationTable,
  ProfileTable,
  WorkspaceInvitationTable,
  WorkspaceMemberTable,
  WorkspaceTable,
} from "./entities";

type CamelCase<S extends string> = S extends `${infer H}_${infer T}`
  ? `${H}${Capitalize<CamelCase<T>>}`
  : S;

type ToCamelCase<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K];
};

export type AppConfig = ToCamelCase<{
  [APP_CONFIG_KEYS.MAX_WORKSPACES_PER_USER]: number;
}>;

export type WorkspaceInvitationMetadata = {
  inviterName: string;
  workspaceName: string;
  invitationId: string;
};

export type Workspace = ToCamelCase<
  Pick<WorkspaceTable, "id" | "name" | "description" | "owner_id">
>;

export type Profile = ToCamelCase<ProfileTable>;

export type Notification = ToCamelCase<
  Pick<
    NotificationTable,
    "id" | "type" | "metadata" | "link" | "read_at" | "created_at"
  >
> & {
  metadata: WorkspaceInvitationMetadata | null;
};

export type WorkspaceInvitation = ToCamelCase<
  Pick<WorkspaceInvitationTable, "id" | "email" | "role">
>;

export type WorkspaceMember = {
  id: WorkspaceMemberTable["id"];
  role: WorkspaceMemberTable["role"];
  fullName: ProfileTable["full_name"];
  email: ProfileTable["email"];
};
