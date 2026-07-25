"use client";

import { DragHandle } from "@/components/ui/drag-handle";
import { UpdateTaskSchema } from "@/schema";
import { Task, WorkspaceMember } from "@/types/dto";
import { TaskStatus } from "@/types/entities";
import { cn } from "@/utils";
import { useSortable } from "@dnd-kit/react/sortable";
import { TaskRow } from "./task-row";

type Props = {
  task: Task;
  index: number;
  members: WorkspaceMember[];
  canEdit: boolean;
  dragEnabled: boolean;
  onUpdateTask: (
    taskId: string,
    patch: Partial<Task>,
    serverPatch: UpdateTaskSchema,
    fallbackErrorKey: string,
  ) => Promise<{ error?: string } | undefined>;
};

export function SortableTaskRow({
  task,
  index,
  members,
  canEdit,
  dragEnabled,
  onUpdateTask,
}: Props) {
  const { ref, handleRef, isDragging } = useSortable({
    id: task.id,
    index,
    group: task.status satisfies TaskStatus,
    disabled: !dragEnabled,
  });

  return (
    <div ref={ref} className={cn(isDragging && "opacity-50")}>
      <TaskRow
        task={task}
        members={members}
        canEdit={canEdit}
        onUpdateTask={onUpdateTask}
        dragHandle={
          dragEnabled ? (
            <DragHandle
              ref={handleRef}
              className="py-2 px-1 -ml-7.5"
            />
          ) : undefined
        }
      />
    </div>
  );
}
