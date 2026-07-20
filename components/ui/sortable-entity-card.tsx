"use client";

import { DragHandle } from "@/components/ui/drag-handle";
import { cn } from "@/utils";
import { useSortable } from "@dnd-kit/react/sortable";
import { ReactNode } from "react";

type Props = {
  id: string;
  index: number;
  disabled: boolean;
  children: (dragHandle: ReactNode | undefined) => ReactNode;
};

export function SortableEntityCard({ id, index, disabled, children }: Props) {
  const { ref, handleRef, isDragging } = useSortable({
    id,
    index,
    disabled,
  });

  return (
    <div ref={ref} className={cn(isDragging && "opacity-50")}>
      {children(
        disabled ? undefined : (
          <DragHandle ref={handleRef} className="-ml-2 py-1.5 px-1" />
        ),
      )}
    </div>
  );
}
