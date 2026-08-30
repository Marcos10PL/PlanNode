"use client";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DeleteButton } from "@/components/ui/delete-button";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { useTaskItemActions } from "@/hooks/use-task-item-actions";
import { TaskItemProps } from "@/types/props";
import { cn } from "@/utils";
import { History } from "lucide-react";
import { InfoPopover } from "../ui/info-popover";
import { AdvanceStatusButton } from "./advance-status-button";
import { SubtaskCardList } from "./subtask-card-list";
import { SubtaskToggle } from "./subtask-toggle";
import { TaskAssigneePopover } from "./task-assignee-popover";
import { TaskDescriptionView } from "./task-description-view";
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
  const {
    t,
    modalOpen,
    setModalOpen,
    modalTab,
    setModalTab,
    deleteOpen,
    setDeleteOpen,
    isPending,
    subtasksExpanded,
    setSubtasksExpanded,
    openDetails,
    openActivity,
    subtasksDone,
    subtasksTotal,
    isOverdue,
    handleStatusChange,
    handlePriorityChange,
    handleAssigneeChange,
    handleDueDateChange,
    handleDelete,
    stopPropagation,
  } = useTaskItemActions({ task, members, subtasks, onUpdateTask });

  return (
    <>
      <div
        className="flex flex-col gap-2.5 rounded-md border bg-background py-2 px-1.5 transition-colors hover:bg-accent/50 cursor-pointer"
        onClick={openDetails}
      >
        <div className="flex items-start gap-0.5 min-w-0">
          {dragHandle && (
            <div onClick={stopPropagation} className="shrink-0 -ml-1 -mt-0.5">
              {dragHandle}
            </div>
          )}

          <p
            className={cn("text-sm font-medium wrap-break-word line-clamp-2", {
              "pl-1": !dragHandle,
            })}
          >
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
                readOnly={!canEdit}
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
                  <TaskDescriptionView html={task.description} />
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
        activeTab={modalTab}
        onTabChange={setModalTab}
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
