"use client";

import { DragHandle } from "@/components/ui/drag-handle";
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
};

export function SortableTaskRow({
  task,
  index,
  members,
  canEdit,
  dragEnabled,
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
