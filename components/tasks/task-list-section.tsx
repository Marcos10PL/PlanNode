"use client";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ManageMenu } from "@/components/ui/manage-menu";
import { TaskProgress } from "@/components/ui/task-progress";
import { TASK_STATUSES } from "@/const";
import { useDeleteTaskList } from "@/hooks/use-delete-task-list";
import { TaskListWithTasks, WorkspaceMember } from "@/types/dto";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { TaskListModal } from "./create-task-list-modal";
import { TaskModal } from "./task-modal";
import { TaskRow } from "./task-row";

type Props = {
  list: TaskListWithTasks;
  members: WorkspaceMember[];
  canEdit: boolean;
};

export function TaskListSection({ list, members, canEdit }: Props) {
  const t = useTranslations("tasks");
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);

  const { remove, isPending } = useDeleteTaskList();

  const doneTasks = list.tasks.filter(
    task => task.status === TASK_STATUSES.DONE,
  ).length;
  const cancelledTasks = list.tasks.filter(
    task => task.status === TASK_STATUSES.CANCELLED,
  ).length;

  const handleDelete = async () => {
    await remove(list.id);
    setDeleteOpen(false);
  };

  return (
    <>
      <div className="flex flex-col mt-4">
        <div className="flex flex-col-reverse md:flex-row md:items-center gap-1">
          <h2 className="text-sm font-semibold min-w-0 break-all">
            {list.name} ({list.tasks.length})
          </h2>
          {canEdit && (
            <div className="self-end">
              <ManageMenu
                disabled={isPending}
                align="start"
                items={[
                  {
                    label: t("list_rename.trigger"),
                    icon: Pencil,
                    onClick: () => setRenameOpen(true),
                  },
                  {
                    label: t("list_delete.trigger"),
                    icon: Trash2,
                    onClick: () => setDeleteOpen(true),
                    destructive: true,
                  },
                ]}
              />
            </div>
          )}
        </div>

        <section className="max-w-7xl mt-6 mb-7">
          <TaskProgress
            total={list.tasks.length}
            done={doneTasks}
            cancelled={cancelledTasks}
            showLabel
          />
        </section>

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
