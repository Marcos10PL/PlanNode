"use client";

import { ERRORS } from "@/const";
import { ReorderAction } from "@/types";
import { ProjectWithProgress } from "@/types/dto";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SortableProjectCard } from "./sortable-project-card";

type Props = {
  projects: ProjectWithProgress[];
  canEdit: boolean;
  isWorkspaceManager?: boolean;
  onReorder: ReorderAction;
  dragEnabled: boolean;
};

export function ProjectList({
  projects,
  canEdit,
  isWorkspaceManager,
  onReorder,
  dragEnabled,
}: Props) {
  const t = useTranslations();
  const router = useRouter();
  const [localProjects, setLocalProjects] = useState(projects);

  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled) return;

    const draggedId = event.operation.source?.id;
    if (!draggedId) return;

    const previousOrder = localProjects;
    const ids = previousOrder.map(project => project.id);
    const movedIds = move(ids, event);

    const oldPosition = new Map(ids.map((id, index) => [id, index]));
    const changes = movedIds
      .map((id, position) => ({ id, position }))
      .filter(({ id, position }) => oldPosition.get(id) !== position);

    if (changes.length === 0) return;

    setTimeout(async () => {
      setLocalProjects(prev => {
        const byId = new Map(prev.map(project => [project.id, project]));
        return movedIds.map(id => byId.get(id)!);
      });

      try {
        const result = await onReorder(changes);
        if (result?.error) {
          setLocalProjects(previousOrder);
          toast.error(
            result.error === ERRORS.INSUFFICIENT_ROLE
              ? t("common.insufficient_role")
              : t("common.unexpected_error"),
          );
          router.refresh();
        }
      } catch {
        setLocalProjects(previousOrder);
        toast.error(t("common.unexpected_error"));
        router.refresh();
      }
    }, 0);
  };

  if (localProjects.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("projects.empty")}</p>
    );
  }

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {localProjects.map((project, index) => (
          <SortableProjectCard
            key={project.id}
            project={project}
            index={index}
            canEdit={canEdit}
            isWorkspaceManager={isWorkspaceManager}
            dragEnabled={dragEnabled}
          />
        ))}
      </div>
    </DragDropProvider>
  );
}
