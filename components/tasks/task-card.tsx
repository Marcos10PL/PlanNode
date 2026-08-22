"use client";

import { deleteTaskAction } from "@/actions/task/delete-task";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DeleteButton } from "@/components/ui/delete-button";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { ERRORS, TASK_STATUSES } from "@/const";
import { TaskAssignee } from "@/types/dto";
import { TaskPriority, TaskStatus } from "@/types/entities";
import { TaskItemProps } from "@/types/props";
import { isTaskOverdue } from "@/utils";
import { History } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { InfoPopover } from "../ui/info-popover";
import { AdvanceStatusButton } from "./advance-status-button";
import { SubtaskCardList } from "./subtask-card-list";
import { SubtaskToggle } from "./subtask-toggle";
import { TaskAssigneePopover } from "./task-assignee-popover";
import { TaskDueDatePopover } from "./task-due-date-popover";
import { TaskModal } from "./task-modal";
import { TaskPrioritySelect } from "./task-priority-select";

type Props = TaskItemProps;

export function TaskCard({
  task,
  members,
  canEdit,
  canManage,
  dragHandle,
  onUpdateTask,
  subtasks = [],
  onSubtaskDragEnd,
  onAddSubtask,
  hiddenStatuses,
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

  return (
    <>
      <div
        className="flex flex-col gap-2.5 rounded-md border bg-background py-2 px-1.5 transition-colors hover:bg-accent/50 cursor-pointer"
        onClick={canEdit ? openDetails : undefined}
      >
        <div className="flex items-start gap-0.5 min-w-0">
          {dragHandle && (
            <div onClick={stopPropagation} className="shrink-0 -ml-1 -mt-0.5">
              {dragHandle}
            </div>
          )}

          <p className="text-sm font-medium wrap-break-word line-clamp-2">
            {task.title}
          </p>
        </div>

        <div className="flex items-center justify-between gap-1">
          <div className="flex min-w-0 items-center gap-1">
            {!task.parentTaskId && (
              <div onClick={stopPropagation} className="shrink-0">
                <SubtaskToggle
                  done={subtasksDone}
                  total={subtasksTotal}
                  expanded={subtasksExpanded}
                  onToggle={() => setSubtasksExpanded(v => !v)}
                />
              </div>
            )}

            <div onClick={stopPropagation} className="shrink-0">
              <TaskAssigneePopover
                assignee={task.assignee}
                members={members}
                canEdit={canEdit}
                onChange={handleAssigneeChange}
              />
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-1">
            <div onClick={stopPropagation} className="shrink-0">
              <TaskPrioritySelect
                value={task.priority}
                onValueChange={handlePriorityChange}
                disabled={!canEdit}
                iconOnly
                size="sm"
              />
            </div>
            {canEdit && (
              <div onClick={stopPropagation} className="shrink-0">
                <AdvanceStatusButton
                  status={task.status}
                  hiddenStatuses={hiddenStatuses}
                  onAdvance={handleStatusChange}
                  disabled={isPending}
                  className="h-7"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-0.5">
          <div className="flex items-center gap-0.5">
            {canEdit && (
              <div onClick={stopPropagation} className="shrink-0">
                <DeleteButton
                  onClick={() => setDeleteOpen(true)}
                  disabled={isPending}
                />
              </div>
            )}
            <div onClick={stopPropagation} className="shrink-0">
              <TooltipIconButton
                icon={History}
                label={t("tasks.view_activity")}
                onClick={openActivity}
                className="text-muted-foreground"
              />
            </div>
            {task.description && (
              <div onClick={stopPropagation} className="shrink-0">
                <InfoPopover
                  label={t("common.description_hint")}
                  variant="ghost"
                  className="size-7 text-muted-foreground [&_svg]:size-4"
                >
                  {task.description}
                </InfoPopover>
              </div>
            )}
          </div>

          <div className="flex items-center gap-0.5">
            <div onClick={stopPropagation} className="min-w-0 shrink-0">
              <TaskDueDatePopover
                dueDate={task.dueDate}
                isOverdue={isOverdue}
                canEdit={canEdit}
                onChange={handleDueDateChange}
                noPlaceholder
              />
            </div>
          </div>
        </div>
      </div>

      {subtasksExpanded && (
        <div onClick={stopPropagation} className="mt-2">
          <SubtaskCardList
            subtasks={subtasks}
            members={members}
            canEdit={canEdit}
            canManage={canManage}
            onUpdateTask={onUpdateTask}
            onDragEnd={onSubtaskDragEnd ?? (() => {})}
            onAddSubtask={onAddSubtask ?? (() => {})}
          />
        </div>
      )}

      <TaskModal
        listId={task.listId}
        members={members}
        task={task}
        canEdit={canEdit}
        canManage={canManage}
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialTab={modalTab}
      />

      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title={t("tasks.delete.confirm_title")}
        description={t("tasks.delete.confirm_description")}
        isPending={isPending}
        variant="destructive"
      />
    </>
  );
}
