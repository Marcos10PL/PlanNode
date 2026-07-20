"use client";

import { deleteTaskAction } from "@/actions/task/delete-task";
import { updateTaskAction } from "@/actions/task/update-task";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { InfoPopover } from "@/components/ui/info-popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ERRORS } from "@/const";
import { Task, WorkspaceMember } from "@/types/dto";
import { TaskPriority, TaskStatus } from "@/types/entities";
import { cn, getPriorityLabel, isTaskOverdue } from "@/utils";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
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
};

export function TaskRow({ task, members, canEdit, dragHandle }: Props) {
  const t = useTranslations();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const isOverdue = isTaskOverdue(task);

  const handleStatusChange = async (status: TaskStatus) => {
    setIsPending(true);
    try {
      const result = await updateTaskAction(task.id, { status });
      if (result?.error)
        toast.error(
          result.error === ERRORS.INSUFFICIENT_ROLE
            ? t("common.insufficient_role")
            : t("tasks.status_change_error"),
        );
    } catch {
      toast.error(t("common.unexpected_error"));
    } finally {
      setIsPending(false);
    }
  };

  const handlePriorityChange = async (priority: TaskPriority) => {
    setIsPending(true);
    try {
      const result = await updateTaskAction(task.id, { priority });
      if (result?.error)
        toast.error(
          result.error === ERRORS.INSUFFICIENT_ROLE
            ? t("common.insufficient_role")
            : t("tasks.priority_change_error"),
        );
    } catch {
      toast.error(t("common.unexpected_error"));
    } finally {
      setIsPending(false);
    }
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
        className={cn(
          "flex items-center gap-2 px-2.5 py-1.5 transition-colors hover:bg-accent/50",
          canEdit && "cursor-pointer",
        )}
        onClick={canEdit ? () => setEditOpen(true) : undefined}
      >
        {dragHandle && (
          <div onClick={stopPropagation} className="shrink-0 absolute">
            {dragHandle}
          </div>
        )}

        <div className="flex flex-1 items-center gap-2 min-w-0">
          <p className="text-sm font-medium line-clamp-1">{task.title}</p>
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
            taskId={task.id}
            assignee={task.assignee}
            members={members}
            canEdit={canEdit}
          />
        </div>

        <div onClick={stopPropagation} className="hidden lg:block shrink-0">
          <TaskPrioritySelect
            value={task.priority}
            onValueChange={handlePriorityChange}
            disabled={isPending || !canEdit}
            iconOnly
            size="sm"
            ariaLabel={getPriorityLabel(task.priority, t)}
          />
        </div>

        <div onClick={stopPropagation} className="hidden lg:block shrink-0">
          <TaskStatusSelect
            value={task.status}
            onValueChange={handleStatusChange}
            disabled={isPending || !canEdit}
            size="sm"
            className="w-40"
          />
        </div>

        <div onClick={stopPropagation} className="hidden lg:block shrink-0">
          <TaskDueDatePopover
            taskId={task.id}
            dueDate={task.dueDate}
            isOverdue={isOverdue}
            canEdit={canEdit}
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
