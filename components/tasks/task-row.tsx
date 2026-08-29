"use client";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DeleteButton } from "@/components/ui/delete-button";
import { InfoPopover } from "@/components/ui/info-popover";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { useTaskItemActions } from "@/hooks/use-task-item-actions";
import { TaskItemProps } from "@/types/props";
import { getPriorityLabel } from "@/utils";
import { History } from "lucide-react";
import { AdvanceStatusButton } from "./advance-status-button";
import { SubtaskList } from "./subtask-list";
import { SubtaskToggle } from "./subtask-toggle";
import { TaskAssigneePopover } from "./task-assignee-popover";
import { TaskDueDatePopover } from "./task-due-date-popover";
import { TaskModal } from "./task-modal";
import { TaskPrioritySelect } from "./task-priority-select";
import { TaskStatusSelect } from "./task-status-select";

type Props = TaskItemProps;

export function TaskRow({
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
    deleteOpen,
    setDeleteOpen,
    isPending,
    subtasksExpanded,
    setSubtasksExpanded,
    openDetails,
    openActivity,
    isSubtask,
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
      <div className="flex flex-col divide-y">
        <div
          className="relative flex cursor-pointer items-center gap-2 px-2.5 py-1.5 transition-colors hover:bg-accent/50"
          onClick={openDetails}
        >
          {dragHandle && (
            <div onClick={stopPropagation} className="shrink-0 absolute">
              {dragHandle}
            </div>
          )}

          {!isSubtask && (
            <div onClick={stopPropagation} className="shrink-0">
              <SubtaskToggle
                done={subtasksDone}
                total={subtasksTotal}
                expanded={subtasksExpanded}
                onToggle={() => setSubtasksExpanded(v => !v)}
              />
            </div>
          )}

          <div className="flex flex-1 items-center gap-2 min-w-0">
            <p className="text-sm font-medium truncate min-w-0">{task.title}</p>
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

          <div onClick={stopPropagation} className="hidden lg:block shrink-0">
            <TaskAssigneePopover
              assignee={task.assignee}
              members={members}
              canEdit={canEdit}
              onChange={handleAssigneeChange}
            />
          </div>

          <div onClick={stopPropagation} className="hidden lg:block shrink-0">
            <TaskPrioritySelect
              value={task.priority}
              onValueChange={handlePriorityChange}
              readOnly={!canEdit}
              iconOnly
              size="sm"
              ariaLabel={getPriorityLabel(task.priority, t)}
            />
          </div>

          {canEdit && (
            <div
              onClick={stopPropagation}
              className="hidden lg:flex items-center shrink-0 gap-0.5"
            >
              <TaskStatusSelect
                value={task.status}
                onValueChange={handleStatusChange}
                size="sm"
                className="w-37"
              />
              <AdvanceStatusButton
                status={task.status}
                hiddenStatuses={hiddenStatuses}
                onAdvance={handleStatusChange}
                disabled={isPending}
              />
            </div>
          )}

          <div onClick={stopPropagation} className="hidden lg:block shrink-0">
            <TaskDueDatePopover
              dueDate={task.dueDate}
              isOverdue={isOverdue}
              canEdit={canEdit}
              onChange={handleDueDateChange}
            />
          </div>

          <div onClick={stopPropagation} className="shrink-0">
            <TooltipIconButton
              icon={History}
              label={t("tasks.view_activity")}
              onClick={openActivity}
              className="text-muted-foreground"
            />
          </div>

          {canEdit && (
            <div onClick={stopPropagation} className="shrink-0">
              <DeleteButton
                onClick={() => setDeleteOpen(true)}
                disabled={isPending}
              />
            </div>
          )}
        </div>

        {!isSubtask && subtasksExpanded && (
          <SubtaskList
            subtasks={subtasks}
            members={members}
            canEdit={canEdit}
            canManage={canManage}
            onUpdateTask={onUpdateTask}
            onDragEnd={onSubtaskDragEnd ?? (() => {})}
            onAddSubtask={onAddSubtask ?? (() => {})}
          />
        )}
      </div>

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
