"use client";

import { deleteTaskAction } from "@/actions/task/delete-task";
import { ERRORS, TASK_STATUSES } from "@/const";
import { TaskAssignee } from "@/types/dto";
import { TaskPriority, TaskStatus } from "@/types/entities";
import { TaskItemProps } from "@/types/props";
import { isTaskOverdue } from "@/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

type Props = Pick<TaskItemProps, "task" | "members" | "onUpdateTask"> & {
  subtasks: TaskItemProps["task"][];
};

export function useTaskItemActions({
  task,
  members,
  subtasks,
  onUpdateTask,
}: Props) {
  const t = useTranslations();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"details" | "activity">("details");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [subtasksExpanded, setSubtasksExpanded] = useState(false);

  const openDetails = () => {
    setModalTab("details");
    setModalOpen(true);
  };

  const openActivity = () => {
    setModalTab("activity");
    setModalOpen(true);
  };

  const isSubtask = !!task.parentTaskId;
  const subtasksDone = subtasks.filter(
    s => s.status === TASK_STATUSES.DONE,
  ).length;
  const subtasksTotal = subtasks.filter(
    s => s.status !== TASK_STATUSES.CANCELLED,
  ).length;

  const isOverdue = isTaskOverdue(task);

  const handleStatusChange = (status: TaskStatus) => {
    onUpdateTask(task.id, { status }, { status }, "tasks.status_change_error");
  };

  const handlePriorityChange = (priority: TaskPriority) => {
    onUpdateTask(
      task.id,
      { priority },
      { priority },
      "tasks.priority_change_error",
    );
  };

  const handleAssigneeChange = (assigneeId: string | null) => {
    const member = assigneeId
      ? members.find(m => m.id === assigneeId)
      : undefined;
    const assignee: TaskAssignee | null = member
      ? { id: member.id, fullName: member.fullName, email: member.email }
      : null;

    onUpdateTask(
      task.id,
      { assigneeId, assignee },
      { assigneeId },
      "tasks.assignee_change_error",
    );
  };

  const handleDueDateChange = (dueDate: string | null) => {
    onUpdateTask(
      task.id,
      { dueDate },
      { dueDate },
      "tasks.due_date_change_error",
    );
  };

  const handleDelete = async () => {
    setIsPending(true);
    try {
      const result = await deleteTaskAction(task.id);
      if (result?.error) {
        toast.error(
          result.error === ERRORS.INSUFFICIENT_ROLE
            ? t("common.insufficient_role")
            : t("tasks.delete.error"),
        );
      } else {
        toast.success(t("tasks.delete.success"));
      }
    } catch {
      toast.error(t("common.unexpected_error"));
    } finally {
      setIsPending(false);
    }
  };

  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return {
    t,
    modalOpen,
    deleteOpen,
    modalTab,
    isPending,

    subtasksDone,
    subtasksTotal,
    isSubtask,
    isOverdue,
    subtasksExpanded,

    setModalOpen,
    setDeleteOpen,
    setSubtasksExpanded,
    stopPropagation,

    openDetails,
    openActivity,

    handleStatusChange,
    handlePriorityChange,
    handleAssigneeChange,
    handleDueDateChange,
    handleDelete,
  };
}
