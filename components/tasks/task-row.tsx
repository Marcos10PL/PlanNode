"use client";

import { deleteTaskAction } from "@/actions/task/delete-task";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { InfoPopover } from "@/components/ui/info-popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ERRORS, TASK_STATUSES, TASK_STATUS_ORDER } from "@/const";
import { UpdateTaskSchema } from "@/schema";
import { Task, TaskAssignee, WorkspaceMember } from "@/types/dto";
import { TaskPriority, TaskStatus } from "@/types/entities";
import { cn, getPriorityLabel, isTaskOverdue } from "@/utils";
import { type DragEndEvent } from "@dnd-kit/react";
import { LayoutList, Pencil, StepForward, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { SubtaskList } from "./subtask-list";
import { TaskAssigneePopover } from "./task-assignee-popover";
import { TaskDueDatePopover } from "./task-due-date-popover";
import { TaskModal } from "./task-modal";
import { TaskPrioritySelect } from "./task-priority-select";
import { TaskStatusSelect } from "./task-status-select";

type Props = {
  task: Task;
  members: WorkspaceMember[];
  canEdit: boolean;
  dragHandle?: React.ReactNode;
  onUpdateTask: (
    taskId: string,
    patch: Partial<Task>,
    serverPatch: UpdateTaskSchema,
    fallbackErrorKey: string,
  ) => Promise<{ error?: string } | undefined>;
  subtasks?: Task[];
  onSubtaskDragEnd?: (event: DragEndEvent) => void;
  onAddSubtask?: () => void;
};

export function TaskRow({
  task,
  members,
  canEdit,
  dragHandle,
  onUpdateTask,
  subtasks = [],
  onSubtaskDragEnd,
  onAddSubtask,
}: Props) {
  const t = useTranslations();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [subtasksExpanded, setSubtasksExpanded] = useState(false);

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

  const handleAdvanceStatus = () => {
    const currentIndex = TASK_STATUS_ORDER.indexOf(task.status);
    const nextStatus =
      TASK_STATUS_ORDER[(currentIndex + 1) % TASK_STATUS_ORDER.length];
    handleStatusChange(nextStatus);
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
      <div className="flex flex-col divide-y">
        <div
          className={cn(
            "relative flex items-center gap-2 px-2.5 py-1.5 transition-colors hover:bg-accent/50",
            canEdit && "cursor-pointer",
          )}
          onClick={canEdit ? () => setEditOpen(true) : undefined}
        >
          {dragHandle && (
            <div onClick={stopPropagation} className="shrink-0 absolute">
              {dragHandle}
            </div>
          )}

          {!isSubtask && (
            <div
              onClick={stopPropagation}
              className="flex items-center gap-1 shrink-0"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={subtasksExpanded ? "secondary" : "outline"}
                    size="icon"
                    className={cn(
                      "h-7 min-w-fit",
                      subtasks.length > 0 ? "px-1.5" : "px-0.5 w-7",
                      subtasksExpanded && "border border-transparent",
                    )}
                    onClick={() => setSubtasksExpanded(v => !v)}
                  >
                    <LayoutList className="size-4" />
                    {subtasks.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {subtasksDone}/{subtasksTotal}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("tasks.subtasks")}</TooltipContent>
              </Tooltip>
            </div>
          )}

          <div className="flex flex-1 items-center gap-2 min-w-0">
            <p className="text-sm font-medium truncate min-w-0">{task.title}</p>
            {task.description && (
              <div onClick={stopPropagation} className="shrink-0">
                <InfoPopover
                  label={t("common.description")}
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
              disabled={!canEdit}
              iconOnly
              size="sm"
              ariaLabel={getPriorityLabel(task.priority, t)}
            />
          </div>

          <div
            onClick={stopPropagation}
            className="hidden lg:flex items-center shrink-0 gap-0.5"
          >
            <TaskStatusSelect
              value={task.status}
              onValueChange={handleStatusChange}
              disabled={!canEdit}
              size="sm"
              className="w-37"
            />
            {canEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="w-6 h-8"
                    onClick={handleAdvanceStatus}
                  >
                    <StepForward className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("tasks.advance_status")}</TooltipContent>
              </Tooltip>
            )}
          </div>

          <div onClick={stopPropagation} className="hidden lg:block shrink-0">
            <TaskDueDatePopover
              dueDate={task.dueDate}
              isOverdue={isOverdue}
              canEdit={canEdit}
              onChange={handleDueDateChange}
            />
          </div>

          {canEdit && (
            <div onClick={stopPropagation} className="lg:hidden shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-info"
                    disabled={isPending}
                    onClick={() => setEditOpen(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("common.edit")}</TooltipContent>
              </Tooltip>
            </div>
          )}

          {canEdit && (
            <div onClick={stopPropagation} className="shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    disabled={isPending}
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("common.delete")}</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {!isSubtask && subtasksExpanded && (
          <SubtaskList
            subtasks={subtasks}
            members={members}
            canEdit={canEdit}
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
        open={editOpen}
        onOpenChange={setEditOpen}
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
