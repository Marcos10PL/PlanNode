"use client";

import { DragHandle } from "@/components/ui/drag-handle";
import { cn } from "@/utils";
import { useSortable } from "@dnd-kit/react/sortable";
import { ReactNode } from "react";

type Props = {
  id: string;
  index: number;
  disabled: boolean;
  children: ReactNode;
};

export function SortableTaskListItem({ id, index, disabled, children }: Props) {
  const { ref, handleRef, isDragging } = useSortable({
    id,
    index,
    disabled,
  });

  return (
    <li
      ref={ref}
      className={cn(
        "group/menu-sub-item group/list relative flex items-center gap-0.5",
        isDragging && "opacity-50",
      )}
    >
      {!disabled && (
        <DragHandle
          ref={handleRef}
          className="h-7 px-0.5 -ml-5"
        />
      )}
      <div className="relative min-w-0 flex-1">{children}</div>
    </li>
  );
}
