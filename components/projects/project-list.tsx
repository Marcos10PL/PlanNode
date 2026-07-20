"use client";

import { reorderProjectsAction } from "@/actions/project/reorder-projects";
import { ProjectWithProgress } from "@/types/dto";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { SortableProjectCard } from "./sortable-project-card";

type Props = {
  projects: ProjectWithProgress[];
  canManage: boolean;
  workspaceId: string;
  dragEnabled: boolean;
};

export function ProjectList({
  projects,
  canManage,
  workspaceId,
  dragEnabled,
}: Props) {
  const t = useTranslations("projects");
  const [localProjects, setLocalProjects] = useState(projects);

  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled) return;

    const draggedId = event.operation.source?.id as string | undefined;
    if (!draggedId) return;

    const ids = localProjects.map(project => project.id);
    const movedIds = move(ids, event);

    const oldPosition = new Map(ids.map((id, index) => [id, index]));
    const changes = movedIds
      .map((id, position) => ({ id, position }))
      .filter(({ id, position }) => oldPosition.get(id) !== position);

    if (changes.length === 0) return;

    setTimeout(() => {
      setLocalProjects(prev => {
        const byId = new Map(prev.map(project => [project.id, project]));
        return movedIds.map(id => byId.get(id)!);
      });
      reorderProjectsAction(workspaceId, changes);
    }, 0);
  };

  if (localProjects.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {localProjects.map((project, index) => (
          <SortableProjectCard
            key={project.id}
            project={project}
            index={index}
            canManage={canManage}
            dragEnabled={dragEnabled}
          />
        ))}
      </div>
    </DragDropProvider>
  );
}
