import { TASK_PRIORITIES, TASK_STATUSES } from "@/const";
import { Translations } from "@/types";
import { TaskPriority, TaskStatus } from "@/types/entities";

export const getStatusLabel = (status: TaskStatus, t: Translations) => {
  switch (status) {
    case TASK_STATUSES.ON_HOLD:
      return t("tasks.status_on_hold");
    case TASK_STATUSES.TODO:
      return t("tasks.status_todo");
    case TASK_STATUSES.IN_PROGRESS:
      return t("tasks.status_in_progress");
    case TASK_STATUSES.IN_REVIEW:
      return t("tasks.status_in_review");
    case TASK_STATUSES.IN_TESTS:
      return t("tasks.status_in_tests");
    case TASK_STATUSES.DONE:
      return t("tasks.status_done");
    case TASK_STATUSES.CANCELLED:
      return t("tasks.status_cancelled");
  }
};

export const getStatusVariant = (status: TaskStatus) => {
  switch (status) {
    case TASK_STATUSES.ON_HOLD:
      return "outline";
    case TASK_STATUSES.TODO:
      return "secondary";
    case TASK_STATUSES.IN_PROGRESS:
    case TASK_STATUSES.IN_REVIEW:
    case TASK_STATUSES.IN_TESTS:
      return "default";
    case TASK_STATUSES.DONE:
      return "secondary";
    case TASK_STATUSES.CANCELLED:
      return "destructive";
  }
};

export const getPriorityLabel = (priority: TaskPriority, t: Translations) => {
  switch (priority) {
    case TASK_PRIORITIES.LOW:
      return t("tasks.priority_low");
    case TASK_PRIORITIES.MEDIUM:
      return t("tasks.priority_medium");
    case TASK_PRIORITIES.HIGH:
      return t("tasks.priority_high");
    case TASK_PRIORITIES.URGENT:
      return t("tasks.priority_urgent");
  }
};

export const getPriorityVariant = (priority: TaskPriority) => {
  switch (priority) {
    case TASK_PRIORITIES.LOW:
      return "outline";
    case TASK_PRIORITIES.MEDIUM:
      return "secondary";
    case TASK_PRIORITIES.HIGH:
      return "default";
    case TASK_PRIORITIES.URGENT:
      return "destructive";
  }
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
