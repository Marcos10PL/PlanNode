import type { ManageMenuItem } from "@/components/ui/manage-menu";
import {
  TASK_PRIORITIES,
  TASK_STATUS_ORDER,
  TASK_STATUSES,
  TASK_URGENCY_BUCKETS,
  TaskUrgencyBucket,
} from "@/const";
import { Translations } from "@/types";
import { Task } from "@/types/dto";
import { TaskPriority, TaskStatus } from "@/types/entities";
import { Pencil, Trash2 } from "lucide-react";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const STATUS_LABEL_KEYS = {
  [TASK_STATUSES.ON_HOLD]: "tasks.status_on_hold",
  [TASK_STATUSES.TODO]: "tasks.status_todo",
  [TASK_STATUSES.IN_PROGRESS]: "tasks.status_in_progress",
  [TASK_STATUSES.IN_REVIEW]: "tasks.status_in_review",
  [TASK_STATUSES.IN_TESTS]: "tasks.status_in_tests",
  [TASK_STATUSES.DONE]: "tasks.status_done",
  [TASK_STATUSES.CANCELLED]: "tasks.status_cancelled",
} as const satisfies Record<TaskStatus, string>;

const STATUS_VARIANT_MAP = {
  [TASK_STATUSES.ON_HOLD]: "outline",
  [TASK_STATUSES.TODO]: "secondary",
  [TASK_STATUSES.IN_PROGRESS]: "default",
  [TASK_STATUSES.IN_REVIEW]: "default",
  [TASK_STATUSES.IN_TESTS]: "default",
  [TASK_STATUSES.DONE]: "secondary",
  [TASK_STATUSES.CANCELLED]: "destructive",
} as const satisfies Record<TaskStatus, BadgeVariant>;

const STATUS_DOT_MAP = {
  [TASK_STATUSES.ON_HOLD]: "bg-amber-500",
  [TASK_STATUSES.TODO]: "bg-gray-400",
  [TASK_STATUSES.IN_PROGRESS]: "bg-blue-500",
  [TASK_STATUSES.IN_REVIEW]: "bg-violet-500",
  [TASK_STATUSES.IN_TESTS]: "bg-cyan-500",
  [TASK_STATUSES.DONE]: "bg-primary",
  [TASK_STATUSES.CANCELLED]: "bg-red-500",
} as const satisfies Record<TaskStatus, string>;

const STATUS_BORDER_MAP = {
  [TASK_STATUSES.ON_HOLD]: "border-amber-500/20",
  [TASK_STATUSES.TODO]: "border-gray-400/20",
  [TASK_STATUSES.IN_PROGRESS]: "border-blue-500/20",
  [TASK_STATUSES.IN_REVIEW]: "border-violet-500/20",
  [TASK_STATUSES.IN_TESTS]: "border-cyan-500/20",
  [TASK_STATUSES.DONE]: "border-primary/20",
  [TASK_STATUSES.CANCELLED]: "border-red-500/20",
} as const satisfies Record<TaskStatus, string>;

const STATUS_BG_MAP = {
  [TASK_STATUSES.ON_HOLD]: "bg-amber-500/10",
  [TASK_STATUSES.TODO]: "bg-gray-400/10",
  [TASK_STATUSES.IN_PROGRESS]: "bg-blue-500/10",
  [TASK_STATUSES.IN_REVIEW]: "bg-violet-500/10",
  [TASK_STATUSES.IN_TESTS]: "bg-cyan-500/10",
  [TASK_STATUSES.DONE]: "bg-primary/10",
  [TASK_STATUSES.CANCELLED]: "bg-red-500/10",
} as const satisfies Record<TaskStatus, string>;

const STATUS_BG_STRONG_MAP = {
  [TASK_STATUSES.ON_HOLD]: "bg-amber-500/20",
  [TASK_STATUSES.TODO]: "bg-gray-400/20",
  [TASK_STATUSES.IN_PROGRESS]: "bg-blue-500/20",
  [TASK_STATUSES.IN_REVIEW]: "bg-violet-500/20",
  [TASK_STATUSES.IN_TESTS]: "bg-cyan-500/20",
  [TASK_STATUSES.DONE]: "bg-primary/20",
  [TASK_STATUSES.CANCELLED]: "bg-red-500/20",
} as const satisfies Record<TaskStatus, string>;

const STATUS_BG_STRONG_HOVER_MAP = {
  [TASK_STATUSES.ON_HOLD]: "hover:bg-amber-500/20",
  [TASK_STATUSES.TODO]: "hover:bg-gray-400/20",
  [TASK_STATUSES.IN_PROGRESS]: "hover:bg-blue-500/20",
  [TASK_STATUSES.IN_REVIEW]: "hover:bg-violet-500/20",
  [TASK_STATUSES.IN_TESTS]: "hover:bg-cyan-500/20",
  [TASK_STATUSES.DONE]: "hover:bg-primary/20",
  [TASK_STATUSES.CANCELLED]: "hover:bg-red-500/20",
} as const satisfies Record<TaskStatus, string>;

const PRIORITY_LABEL_KEYS = {
  [TASK_PRIORITIES.LOW]: "tasks.priority_low",
  [TASK_PRIORITIES.MEDIUM]: "tasks.priority_medium",
  [TASK_PRIORITIES.HIGH]: "tasks.priority_high",
  [TASK_PRIORITIES.URGENT]: "tasks.priority_urgent",
} as const satisfies Record<TaskPriority, string>;

const PRIORITY_VARIANT_MAP = {
  [TASK_PRIORITIES.LOW]: "outline",
  [TASK_PRIORITIES.MEDIUM]: "secondary",
  [TASK_PRIORITIES.HIGH]: "default",
  [TASK_PRIORITIES.URGENT]: "destructive",
} as const satisfies Record<TaskPriority, BadgeVariant>;

const PRIORITY_FLAG_MAP = {
  [TASK_PRIORITIES.LOW]: "text-muted-foreground",
  [TASK_PRIORITIES.MEDIUM]: "text-sky-500",
  [TASK_PRIORITIES.HIGH]: "text-amber-500",
  [TASK_PRIORITIES.URGENT]: "text-red-500",
} as const satisfies Record<TaskPriority, string>;

export const getStatusLabel = (status: TaskStatus, t: Translations) =>
  t(STATUS_LABEL_KEYS[status]);

export const getStatusVariant = (status: TaskStatus) =>
  STATUS_VARIANT_MAP[status];

export const getStatusDotClass = (status: TaskStatus) => STATUS_DOT_MAP[status];

export const getStatusBorderClass = (status: TaskStatus) =>
  STATUS_BORDER_MAP[status];

export const getStatusBgClass = (status: TaskStatus) => STATUS_BG_MAP[status];

export const getStatusBgStrongClass = (status: TaskStatus) =>
  STATUS_BG_STRONG_MAP[status];

export const getStatusBgStrongHoverClass = (status: TaskStatus) =>
  STATUS_BG_STRONG_HOVER_MAP[status];

export const getPriorityLabel = (priority: TaskPriority, t: Translations) =>
  t(PRIORITY_LABEL_KEYS[priority]);

export const getPriorityVariant = (priority: TaskPriority) =>
  PRIORITY_VARIANT_MAP[priority];

export const getPriorityFlagClass = (priority: TaskPriority) =>
  PRIORITY_FLAG_MAP[priority];

export const isTaskOverdue = (task: Pick<Task, "dueDate" | "status">) => {
  if (
    !task.dueDate ||
    task.status === TASK_STATUSES.DONE ||
    task.status === TASK_STATUSES.CANCELLED
  )
    return false;

  const [year, month, day] = task.dueDate.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999) < new Date();
};

const URGENCY_BUCKET_LABEL_KEYS = {
  [TASK_URGENCY_BUCKETS.OVERDUE]: "dashboard.overdue",
  [TASK_URGENCY_BUCKETS.TODAY]: "dashboard.due_today",
  [TASK_URGENCY_BUCKETS.THIS_WEEK]: "dashboard.due_this_week",
  [TASK_URGENCY_BUCKETS.LATER]: "dashboard.later",
} as const satisfies Record<TaskUrgencyBucket, string>;

export const getTaskUrgencyBucketLabel = (
  bucket: TaskUrgencyBucket,
  t: Translations,
) => t(URGENCY_BUCKET_LABEL_KEYS[bucket]);

export const getTaskUrgencyBucket = (
  dueDate: string | null,
): TaskUrgencyBucket => {
  if (!dueDate) return TASK_URGENCY_BUCKETS.LATER;

  const [year, month, day] = dueDate.split("-").map(Number);
  const due = new Date(year, month - 1, day);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.round(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) return TASK_URGENCY_BUCKETS.OVERDUE;
  if (diffDays === 0) return TASK_URGENCY_BUCKETS.TODAY;
  if (diffDays <= 7) return TASK_URGENCY_BUCKETS.THIS_WEEK;
  return TASK_URGENCY_BUCKETS.LATER;
};

export const getNextStatus = (
  currentStatus: TaskStatus,
  hiddenStatuses?: Set<TaskStatus>,
): TaskStatus => {
  const currentIndex = TASK_STATUS_ORDER.indexOf(currentStatus);
  let nextIndex = (currentIndex + 1) % TASK_STATUS_ORDER.length;

  while (
    hiddenStatuses?.has(TASK_STATUS_ORDER[nextIndex]) &&
    nextIndex !== currentIndex
  ) {
    nextIndex = (nextIndex + 1) % TASK_STATUS_ORDER.length;
  }

  return TASK_STATUS_ORDER[nextIndex];
};

export const getListManageMenuItems = ({
  canManage,
  onRename,
  onDelete,
  t,
}: {
  canManage: boolean;
  onRename: () => void;
  onDelete: () => void;
  t: Translations;
}): ManageMenuItem[] => {
  if (!canManage) return [];

  return [
    {
      label: t("list_rename.trigger"),
      icon: Pencil,
      onClick: onRename,
    },
    {
      label: t("list_delete.trigger"),
      icon: Trash2,
      onClick: onDelete,
      destructive: true,
    },
  ];
};

export const getProjectProgress = (
  total: number,
  done: number,
  cancelled: number,
) => {
  const denominator = total - cancelled;
  if (denominator <= 0) return 0;

  return Math.round((done / denominator) * 100);
};
