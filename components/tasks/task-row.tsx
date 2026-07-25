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
import { ERRORS } from "@/const";
import { UpdateTaskSchema } from "@/schema";
import { Task, TaskAssignee, WorkspaceMember } from "@/types/dto";
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
  onUpdateTask: (
    taskId: string,
    patch: Partial<Task>,
    serverPatch: UpdateTaskSchema,
    fallbackErrorKey: string,
  ) => Promise<{ error?: string } | undefined>;
};

export function TaskRow({
  task,
  members,
  canEdit,
  dragHandle,
  onUpdateTask,
}: Props) {
  const t = useTranslations();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

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

        <div onClick={stopPropagation} className="hidden lg:block shrink-0">
          <TaskStatusSelect
            value={task.status}
            onValueChange={handleStatusChange}
            disabled={!canEdit}
            size="sm"
            className="w-40"
          />
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
