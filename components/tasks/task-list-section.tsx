"use client";

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
import { useDeleteTaskList } from "@/hooks/use-delete-task-list";
import { TaskListWithTasks, WorkspaceMember } from "@/types/dto";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { TaskListModal } from "./create-task-list-modal";
import { TaskModal } from "./task-modal";
import { TaskRow } from "./task-row";

type Props = {
  list: TaskListWithTasks;
  members: WorkspaceMember[];
  canEdit: boolean;
  children?: React.ReactNode;
};

export function TaskListSection({ list, members, canEdit, children }: Props) {
  const t = useTranslations("tasks");
  const tCommon = useTranslations("common");
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  const { remove, isPending } = useDeleteTaskList();

  const handleDelete = async () => {
    await remove(list.id);
    setDeleteOpen(false);
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center gap-1">
          <h2 className="text-sm font-semibold min-w-0 line-clamp-1">
            {list.name}{" "}
            <span className="text-muted-foreground font-normal">
              ({list.tasks.length})
            </span>
          </h2>
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
                <TooltipContent>{tCommon("manage")}</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setRenameOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {t("list_rename.trigger")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("list_delete.trigger")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {children}

        {list.tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">{t("empty")}</p>
        ) : (
          <div className="flex flex-col divide-y divide-accent/70">
            {list.tasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                members={members}
                canEdit={canEdit}
              />
            ))}
          </div>
        )}

        {canEdit && (
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground mt-1"
            onClick={() => setCreateTaskOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("add_task")}
          </Button>
        )}
      </div>

      <TaskListModal
        projectId={list.projectId}
        list={list}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />

      <TaskModal
        listId={list.id}
        members={members}
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
      />

      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title={t("list_delete.confirm_title")}
        description={t("list_delete.confirm_description")}
        isPending={isPending}
        variant="destructive"
      />
    </>
  );
}
