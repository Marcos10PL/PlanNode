"use client";

import { DragHandle } from "@/components/ui/drag-handle";
import { UpdateTaskSchema } from "@/schema";
import { Task, WorkspaceMember } from "@/types/dto";
import { cn } from "@/utils";
import { type DragEndEvent } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { TaskRow } from "./task-row";

type Props = {
  task: Task;
  index: number;
  members: WorkspaceMember[];
  canEdit: boolean;
  canManage: boolean;
  dragEnabled: boolean;
  onUpdateTask: (
    taskId: string,
    patch: Partial<Task>,
    serverPatch: UpdateTaskSchema,
    fallbackErrorKey: string,
  ) => Promise<{ error?: string } | undefined>;
  subtasks?: Task[];
  onSubtaskDragEnd?: (event: DragEndEvent) => void;
  onAddSubtask?: () => void;
};

export function SortableTaskRow({
  task,
  index,
  members,
  canEdit,
  canManage,
  dragEnabled,
  onUpdateTask,
  subtasks,
  onSubtaskDragEnd,
  onAddSubtask,
}: Props) {
  const { ref, handleRef, isDragging } = useSortable({
    id: task.id,
    index,
    group: task.parentTaskId ?? task.status,
    disabled: !dragEnabled,
  });

  return (
    <div ref={ref} className={cn(isDragging && "opacity-50")}>
      <TaskRow
        task={task}
        members={members}
        canEdit={canEdit}
        canManage={canManage}
        onUpdateTask={onUpdateTask}
        subtasks={subtasks}
        onSubtaskDragEnd={onSubtaskDragEnd}
        onAddSubtask={onAddSubtask}
        dragHandle={
          dragEnabled ? (
            <DragHandle ref={handleRef} className="py-2 px-1 -ml-7.5" />
          ) : undefined
        }
      />
    </div>
  );
}
