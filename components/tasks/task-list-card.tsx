"use client";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EntityCard } from "@/components/ui/entity-card";
import { ManageMenu } from "@/components/ui/manage-menu";
import { useDeleteTaskList } from "@/hooks/use-delete-task-list";
import { ProjectListSummary } from "@/types/dto";
import { generateListRoute } from "@/utils/helpers";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { TaskListModal } from "./create-task-list-modal";

type Props = {
  list: ProjectListSummary;
  projectId: string;
  canEdit: boolean;
};

export function TaskListCard({ list, projectId, canEdit }: Props) {
  const t = useTranslations("tasks");
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { remove, isPending } = useDeleteTaskList();

  const handleDelete = async () => {
    await remove(list.id);
    setDeleteOpen(false);
  };

  return (
    <>
      <EntityCard
        href={generateListRoute(projectId, list.id)}
        title={list.name}
        actions={
          canEdit ? (
            <ManageMenu
              disabled={isPending}
              triggerClassName="h-7 w-7"
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
          ) : undefined
        }
        progress={{
          total: list.taskCount,
          done: list.doneCount,
          cancelled: list.cancelledCount,
        }}
      />

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
        title={t("list_delete.confirm_title")}
        description={t("list_delete.confirm_description")}
        isPending={isPending}
        variant="destructive"
      />
    </>
  );
}
