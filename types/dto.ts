import { APP_CONFIG_KEYS } from "@/const";
import {
  NotificationPreferenceTable,
  NotificationTable,
  ProfileTable,
  ProjectTable,
  TaskCommentTable,
  TaskEventTable,
  TaskListTable,
  TaskTable,
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

type ResolvedActor = {
  actorEmail?: string | null;
  actorDeleted?: boolean;
};

export type WorkspaceInvitationMetadata = {
  inviterId: string;
  inviterName?: string | null;
  workspaceName: string;
  invitationId: string;
} & ResolvedActor;

export type Workspace = ToCamelCase<
  Pick<WorkspaceTable, "id" | "name" | "description" | "owner_id">
> & { memberCount: number };

export type Profile = ToCamelCase<ProfileTable>;

export type TaskAssignedMetadata = {
  taskTitle: string;
  projectName: string;
  assignerId: string;
  assignerName?: string | null;
  taskId: string;
} & ResolvedActor;

export type ProjectMemberAddedMetadata = {
  projectName: string;
  addedById: string;
  addedByName?: string | null;
  projectId: string;
} & ResolvedActor;

export type TaskCommentAddedMetadata = {
  taskTitle: string;
  commenterId: string;
  commenterName?: string | null;
  taskId: string;
} & ResolvedActor;

export type WorkspaceRoleChangedMetadata = {
  workspaceName: string;
  changedById: string;
  changedByName?: string | null;
  newRole: string;
} & ResolvedActor;

export type Notification = ToCamelCase<
  Pick<
    NotificationTable,
    "id" | "type" | "metadata" | "link" | "read_at" | "created_at"
  >
> & {
  metadata:
    | WorkspaceInvitationMetadata
    | TaskAssignedMetadata
    | ProjectMemberAddedMetadata
    | TaskCommentAddedMetadata
    | WorkspaceRoleChangedMetadata
    | null;
};

export type NotificationPreference = ToCamelCase<
  Pick<NotificationPreferenceTable, "type" | "email_enabled" | "in_app_enabled">
>;

export type WorkspaceInvitation = ToCamelCase<
  Pick<WorkspaceInvitationTable, "id" | "email" | "role">
>;

export type InvitationDetails = ToCamelCase<
  Pick<WorkspaceInvitationTable, "id" | "email" | "role" | "expires_at">
> & {
  workspaceName: string | null;
  inviterName: string | null;
};

export type WorkspaceMember = {
  id: WorkspaceMemberTable["id"];
  role: WorkspaceMemberTable["role"];
  fullName: ProfileTable["full_name"];
  email: ProfileTable["email"];
};

export type Project = ToCamelCase<
  Pick<
    ProjectTable,
    | "id"
    | "workspace_id"
    | "name"
    | "description"
    | "is_private"
    | "is_completed"
    | "icon"
    | "color"
    | "created_by"
    | "created_at"
    | "deleted_at"
  >
> & {
  isFavorite: boolean;
};

export type ProjectWithProgress = Project & {
  favoritePosition: number | null;
  totalTasks: number;
  doneTasks: number;
  cancelledTasks: number;
  lists: ProjectListSummary[];
};

export type TaskAssignee = {
  id: ProfileTable["id"];
  fullName: ProfileTable["full_name"];
  email: ProfileTable["email"];
};

export type Task = ToCamelCase<
  Pick<
    TaskTable,
    | "id"
    | "project_id"
    | "list_id"
    | "parent_task_id"
    | "title"
    | "description"
    | "status"
    | "priority"
    | "assignee_id"
    | "due_date"
    | "position"
    | "created_by"
    | "deleted_at"
  >
> & {
  assignee: TaskAssignee | null;
};

export type TaskListWithTasks = ToCamelCase<
  Pick<
    TaskListTable,
    "id" | "project_id" | "name" | "position" | "created_by" | "deleted_at"
  >
> & {
  tasks: Task[];
};

export type TrashedTaskList = ToCamelCase<
  Pick<
    TaskListTable,
    "id" | "project_id" | "name" | "created_by" | "deleted_at"
  >
>;

export type TrashedTask = ToCamelCase<
  Pick<
    TaskTable,
    | "id"
    | "project_id"
    | "list_id"
    | "parent_task_id"
    | "title"
    | "created_by"
    | "deleted_at"
  >
> & {
  listName: string;
  parentTitle: string | null;
};

export type ProjectListSummary = {
  id: TaskListTable["id"];
  name: TaskListTable["name"];
  taskCount: number;
  doneCount: number;
  cancelledCount: number;
};

export type MyTask = Task & {
  projectName: string;
};

export type StatusChangedMetadata = {
  from: Task["status"];
  to: Task["status"];
};

export type PriorityChangedMetadata = {
  from: Task["priority"];
  to: Task["priority"];
};

export type AssigneeChangedMetadata = {
  fromId: string | null;
  fromName?: string | null;
  fromEmail?: string | null;
  toId: string | null;
  toName?: string | null;
  toEmail?: string | null;
};

export type DueDateChangedMetadata = {
  from: string | null;
  to: string | null;
};

export type TaskEventUser = {
  id: ProfileTable["id"];
  fullName: ProfileTable["full_name"];
  email: ProfileTable["email"];
};

export type TaskEventMetadata =
  | StatusChangedMetadata
  | PriorityChangedMetadata
  | AssigneeChangedMetadata
  | DueDateChangedMetadata;

export type TaskEvent = ToCamelCase<
  Pick<TaskEventTable, "id" | "task_id" | "type" | "created_at">
> & {
  metadata: TaskEventMetadata;
  user: TaskEventUser | null;
};

export type TaskComment = ToCamelCase<
  Pick<
    TaskCommentTable,
    "id" | "task_id" | "content" | "created_at" | "updated_at"
  >
> & {
  user: TaskEventUser | null;
};

export type TaskTimelineItem =
  | ({ kind: "event" } & TaskEvent)
  | ({ kind: "comment" } & TaskComment);
