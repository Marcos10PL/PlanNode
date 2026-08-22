"use client";

import { SubtaskListProps } from "@/types/props";
import { DragDropProvider } from "@dnd-kit/react";
import { useTranslations } from "next-intl";
import { AddRowButton } from "./add-row-button";
import { SortableTaskCard } from "./sortable-task-card";

type Props = SubtaskListProps;

export function SubtaskCardList({
  subtasks,
  members,
  canEdit,
  canManage,
  onUpdateTask,
  onDragEnd,
  onAddSubtask,
}: Props) {
  const t = useTranslations("tasks");

  return (
    <div className="ml-2.5 flex flex-col gap-2">
      <DragDropProvider onDragEnd={onDragEnd}>
        {subtasks.map((subtask, index) => (
          <SortableTaskCard
            key={subtask.id}
            task={subtask}
            index={index}
            members={members}
            canEdit={canEdit}
            canManage={canManage}
            dragEnabled={canEdit}
            onUpdateTask={onUpdateTask}
          />
        ))}
      </DragDropProvider>
      {canEdit && (
        <AddRowButton label={t("add_subtask")} onClick={onAddSubtask} />
      )}
    </div>
  );
}
