"use client";

import { SubtaskListProps } from "@/types/props";
import { DragDropProvider } from "@dnd-kit/react";
import { useTranslations } from "next-intl";
import { AddRowButton } from "./add-row-button";
import { SortableTaskRow } from "./sortable-task-row";

type Props = SubtaskListProps;

export function SubtaskList({
  subtasks,
  members,
  canEdit,
  canManage,
  onUpdateTask,
  onDragEnd,
  onAddSubtask,
}: Props) {
  const t = useTranslations("tasks");

  if (subtasks.length === 0 && !canEdit) {
    return (
      <div className="ml-5 border-l pl-4">
        <p className="text-sm text-muted-foreground py-2">
          {t("no_subtasks")}
        </p>
      </div>
    );
  }

  return (
    <div className="ml-5 border-l pl-2">
      <DragDropProvider onDragEnd={onDragEnd}>
        <div className="flex flex-col divide-y">
          {subtasks.map((subtask, index) => (
            <SortableTaskRow
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
          {canEdit && (
            <AddRowButton label={t("add_subtask")} onClick={onAddSubtask} />
          )}
        </div>
      </DragDropProvider>
    </div>
  );
}
