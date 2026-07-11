"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { TaskProgress } from "@/components/ui/task-progress";
import { useDeleteTaskList } from "@/hooks/use-delete-task-list";
import { ProjectListSummary } from "@/types/dto";
import { generateListRoute } from "@/utils/helpers";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { TaskListModal } from "./create-task-list-modal";

type Props = {
  list: ProjectListSummary;
  projectId: string;
  canEdit: boolean;
};

export function TaskListCard({ list, projectId, canEdit }: Props) {
  const t = useTranslations();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { remove, isPending } = useDeleteTaskList();

  const handleDelete = async () => {
    await remove(list.id);
    setDeleteOpen(false);
  };

  return (
    <>
      <Card className="relative hover:bg-accent/50 transition-colors">
        <Link
          href={generateListRoute(projectId, list.id)}
          className="absolute inset-0"
          aria-label={list.name}
        />
        <CardContent className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 text-sm font-medium line-clamp-1">
              {list.name}
            </span>
            {canEdit && (
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0 relative z-10 -my-1"
                        disabled={isPending}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>{t("common.manage")}</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setRenameOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t("tasks.list_rename.trigger")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("tasks.list_delete.trigger")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <TaskProgress
            total={list.taskCount}
            done={list.doneCount}
            cancelled={list.cancelledCount}
            size="sm"
            className="gap-2 mt-2"
          />
        </CardContent>
      </Card>

      <TaskListModal
        projectId={projectId}
        list={list}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />

      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title={t("tasks.list_delete.confirm_title")}
        description={t("tasks.list_delete.confirm_description")}
        isPending={isPending}
        variant="destructive"
      />
    </>
  );
}
