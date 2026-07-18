import { TASK_PRIORITIES, TASK_STATUSES } from "@/const";
import { Translations } from "@/types";
import { Task } from "@/types/dto";
import { TaskPriority, TaskStatus } from "@/types/entities";

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
  [TASK_STATUSES.ON_HOLD]: "border-amber-500/50",
  [TASK_STATUSES.TODO]: "border-gray-400/50",
  [TASK_STATUSES.IN_PROGRESS]: "border-blue-500/50",
  [TASK_STATUSES.IN_REVIEW]: "border-violet-500/50",
  [TASK_STATUSES.IN_TESTS]: "border-cyan-500/50",
  [TASK_STATUSES.DONE]: "border-primary/50",
  [TASK_STATUSES.CANCELLED]: "border-red-500/50",
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

export const getProjectProgress = (
  total: number,
  done: number,
  cancelled: number,
) => {
  const denominator = total - cancelled;
  if (denominator <= 0) return 0;

  return Math.round((done / denominator) * 100);
};
