"use client";

import { DragHandle } from "@/components/ui/drag-handle";
import { ProjectWithProgress } from "@/types/dto";
import { cn } from "@/utils";
import { useSortable } from "@dnd-kit/react/sortable";
import { SidebarProjectItem } from "./sidebar-project-item";

type Props = {
  project: ProjectWithProgress;
  index: number;
  isExpanded: boolean;
  dragEnabled: boolean;
  onToggle: (projectId: string, open: boolean) => void;
};

export function SortableSidebarProjectItem({
  project,
  index,
  isExpanded,
  dragEnabled,
  onToggle,
}: Props) {
  const { ref, handleRef, isDragging } = useSortable({
    id: project.id,
    index,
    disabled: !dragEnabled,
  });

  return (
    <SidebarProjectItem
      ref={ref}
      project={project}
      isExpanded={isExpanded}
      onToggle={onToggle}
      className={cn(isDragging && "opacity-50")}
      dragHandle={
        dragEnabled ? (
          <DragHandle
            ref={handleRef}
            className="absolute -left-6.5 h-8 px-0.5 group-data-[collapsible=icon]:hidden ml-2"
          />
        ) : undefined
      }
    />
  );
}
