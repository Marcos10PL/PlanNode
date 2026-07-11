"use client";

import { deleteTaskAction } from "@/actions/task/delete-task";
import { updateTaskStatusAction } from "@/actions/task/update-task-status";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UserAvatar from "@/components/user-avatar";
import { TASK_STATUSES } from "@/const";
import { Task, WorkspaceMember } from "@/types/dto";
import { TaskStatus } from "@/types/entities";
import {
  cn,
  formatDate,
  getPriorityLabel,
  getPriorityVariant,
  getStatusLabel,
  getStatusVariant,
  isTaskOverdue,
} from "@/utils";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { TaskModal } from "./task-modal";

type Props = {
  task: Task;
  members: WorkspaceMember[];
  canEdit: boolean;
};

export function TaskRow({ task, members, canEdit }: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const isOverdue = isTaskOverdue(task);

  const handleStatusChange = async (status: TaskStatus) => {
    setIsPending(true);
    try {
      const result = await updateTaskStatusAction(task.id, { status });
      if (result?.error) toast.error(t("tasks.status_change_error"));
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
        toast.error(t("tasks.delete.error"));
      } else {
        toast.success(t("tasks.delete.success"));
      }
    } catch {
      toast.error(t("common.unexpected_error"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 py-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-1">{task.title}</p>
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">
              {task.description}
            </p>
          )}
        </div>

        {task.dueDate && (
          <span
            className={cn(
              "text-xs shrink-0",
              isOverdue ? "text-destructive font-medium" : "text-muted-foreground",
            )}
          >
            {formatDate(task.dueDate, locale)}
          </span>
        )}

        <Badge
          variant={getPriorityVariant(task.priority)}
          className="shrink-0 pointer-events-none hidden sm:inline-flex"
        >
          {getPriorityLabel(task.priority, t)}
        </Badge>

        {canEdit ? (
          <Select
            value={task.status}
            onValueChange={v => handleStatusChange(v as TaskStatus)}
            disabled={isPending}
          >
            <SelectTrigger className="w-36 shrink-0" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(TASK_STATUSES).map(status => (
                <SelectItem key={status} value={status}>
                  {getStatusLabel(status, t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge
            variant={getStatusVariant(task.status)}
            className="shrink-0 pointer-events-none"
          >
            {getStatusLabel(task.status, t)}
          </Badge>
        )}

        {task.assignee && (
          <UserAvatar
            name={task.assignee.fullName}
            className="h-7 w-7 shrink-0"
          />
        )}

        {canEdit && (
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={isPending}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>{t("common.manage")}</TooltipContent>
            </Tooltip>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                {t("tasks.edit.trigger")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("tasks.delete.trigger")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
