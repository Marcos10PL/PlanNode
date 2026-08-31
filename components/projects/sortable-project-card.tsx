"use client";

import { SortableEntityCard } from "@/components/ui/sortable-entity-card";
import { ProjectWithProgress } from "@/types/dto";
import { ProjectCard } from "./project-card";

type Props = {
  project: ProjectWithProgress;
  index: number;
  canEdit: boolean;
  isWorkspaceManager?: boolean;
  dragEnabled: boolean;
};

export function SortableProjectCard({
  project,
  index,
  canEdit,
  isWorkspaceManager,
  dragEnabled,
}: Props) {
  return (
    <SortableEntityCard
      id={project.id}
      index={index}
      disabled={!dragEnabled}
    >
      {dragHandle => (
        <ProjectCard
          project={project}
          canEdit={canEdit}
          isWorkspaceManager={isWorkspaceManager}
          dragHandle={dragHandle}
        />
      )}
    </SortableEntityCard>
  );
}
