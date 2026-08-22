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
