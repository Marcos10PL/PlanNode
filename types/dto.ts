import { APP_CONFIG_KEYS } from "@/const";
import {
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

export type WorkspaceInvitationMetadata = {
  inviterName: string;
  workspaceName: string;
  invitationId: string;
};

export type Workspace = ToCamelCase<
  Pick<WorkspaceTable, "id" | "name" | "description" | "owner_id">
>;

export type Profile = ToCamelCase<ProfileTable>;

export type TaskAssignedMetadata = {
  taskTitle: string;
  projectName: string;
  assignerName: string;
  taskId: string;
};

export type ProjectMemberAddedMetadata = {
  projectName: string;
  addedByName: string;
  projectId: string;
};

export type TaskCommentAddedMetadata = {
  taskTitle: string;
  commenterName: string;
  taskId: string;
};

export type WorkspaceRoleChangedMetadata = {
  workspaceName: string;
  changedByName: string;
  newRole: string;
};

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
  >
> & {
  assignee: TaskAssignee | null;
};

export type TaskListWithTasks = ToCamelCase<
  Pick<TaskListTable, "id" | "project_id" | "name" | "position">
> & {
  tasks: Task[];
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
  fromName: string | null;
  fromEmail: string | null;
  toName: string | null;
  toEmail: string | null;
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
