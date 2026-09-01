"use client";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EntityCard } from "@/components/ui/entity-card";
import { ManageMenu } from "@/components/ui/manage-menu";
import { useDeleteTaskList } from "@/hooks/use-delete-task-list";
import { ProjectListSummary } from "@/types/dto";
import { getListManageMenuItems } from "@/utils";
import { generateListRoute } from "@/utils/helpers";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { TaskListModal } from "./create-task-list-modal";

type Props = {
  list: ProjectListSummary;
  projectId: string;
  canEdit: boolean;
  dragHandle?: React.ReactNode;
};

export function TaskListCard({ list, projectId, canEdit, dragHandle }: Props) {
  const t = useTranslations("tasks");
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { remove, isPending } = useDeleteTaskList();

  const items = getListManageMenuItems({
    canEdit,
    onRename: () => setRenameOpen(true),
    onDelete: () => setDeleteOpen(true),
    t,
  });

  const handleDelete = async () => {
    const ok = await remove(list.id);
    if (ok) setDeleteOpen(false);
  };

  return (
    <>
      <EntityCard
        href={generateListRoute(projectId, list.id)}
        title={list.name}
        dragHandle={dragHandle}
        actions={
          <ManageMenu
            disabled={isPending}
            triggerClassName="h-7 w-7"
            items={items}
          />
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
