"use client";

import { UpdateTaskSchema } from "@/schema";
import { Task, WorkspaceMember } from "@/types/dto";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { useTranslations } from "next-intl";
import { AddRowButton } from "./add-row-button";
import { SortableTaskRow } from "./sortable-task-row";

type Props = {
  subtasks: Task[];
  members: WorkspaceMember[];
  canEdit: boolean;
  onUpdateTask: (
    taskId: string,
    patch: Partial<Task>,
    serverPatch: UpdateTaskSchema,
    fallbackErrorKey: string,
  ) => Promise<{ error?: string } | undefined>;
  onDragEnd: (event: DragEndEvent) => void;
  onAddSubtask: () => void;
};

export function SubtaskList({
  subtasks,
  members,
  canEdit,
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
