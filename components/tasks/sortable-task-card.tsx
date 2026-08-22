"use client";

import { DragHandle } from "@/components/ui/drag-handle";
import { SortableTaskItemProps } from "@/types/props";
import { cn } from "@/utils";
import { useSortable } from "@dnd-kit/react/sortable";
import { TaskCard } from "./task-card";

type Props = SortableTaskItemProps;

export function SortableTaskCard({
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
  hiddenStatuses,
}: Props) {
  const { ref, handleRef, isDragging } = useSortable({
    id: task.id,
    index,
    group: task.status,
    disabled: !dragEnabled,
  });

  return (
    <div ref={ref} className={cn(isDragging && "opacity-50")}>
      <TaskCard
        task={task}
        members={members}
        canEdit={canEdit}
        canManage={canManage}
        onUpdateTask={onUpdateTask}
        subtasks={subtasks}
        onSubtaskDragEnd={onSubtaskDragEnd}
        onAddSubtask={onAddSubtask}
        hiddenStatuses={hiddenStatuses}
        dragHandle={
          dragEnabled ? (
            <DragHandle ref={handleRef} className="h-6 w-6" />
          ) : undefined
        }
      />
    </div>
  );
}
