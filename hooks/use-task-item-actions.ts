"use client";

import { deleteTaskAction } from "@/actions/task/delete-task";
import { ERRORS, TASK_MODAL_TABS, TASK_STATUSES, TaskModalTab } from "@/const";
import { TaskAssignee } from "@/types/dto";
import { TaskPriority, TaskStatus } from "@/types/entities";
import { TaskItemProps } from "@/types/props";
import { isTaskOverdue } from "@/utils";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startDeleteTransition] = useTransition();
  const [subtasksExpanded, setSubtasksExpanded] = useState(false);

  const [modalOpen, setModalOpenState] = useState(
    () => searchParams.get("taskId") === task.id,
  );
  const [modalTab, setModalTabState] = useState<TaskModalTab>(() =>
    searchParams.get("tab") === TASK_MODAL_TABS.ACTIVITY
      ? TASK_MODAL_TABS.ACTIVITY
      : TASK_MODAL_TABS.DETAILS,
  );

  const syncUrl = (open: boolean, tab: TaskModalTab) => {
    const params = new URLSearchParams(searchParams);
    if (open) {
      params.set("taskId", task.id);
      params.set("tab", tab);
    } else {
      if (searchParams.get("taskId") !== task.id) return;
      params.delete("taskId");
      params.delete("tab");
    }
    router.replace(params.size > 0 ? `?${params.toString()}` : "?", {
      scroll: false,
    });
  };

  const setModalTab = (tab: TaskModalTab) => {
    setModalTabState(tab);
    setModalOpenState(true);
    syncUrl(true, tab);
  };

  const setModalOpen = (open: boolean) => {
    setModalOpenState(open);
    syncUrl(open, modalTab);
  };

  const openDetails = () => setModalTab(TASK_MODAL_TABS.DETAILS);
  const openActivity = () => setModalTab(TASK_MODAL_TABS.ACTIVITY);

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

  const handleDelete = () => {
    startDeleteTransition(async () => {
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
          setDeleteOpen(false);
        }
      } catch {
        toast.error(t("common.unexpected_error"));
      }
    });
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
    setModalTab,
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
