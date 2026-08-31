"use client";

import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { EntityCard } from "@/components/ui/entity-card";
import { ManageMenu } from "@/components/ui/manage-menu";
import { useDeleteProject } from "@/hooks/use-delete-project";
import { useToggleProjectCompleted } from "@/hooks/use-toggle-project-completed";
import { useToggleProjectFavorite } from "@/hooks/use-toggle-project-favorite";
import { ProjectWithProgress } from "@/types/dto";
import {
  getProjectColorTextClass,
  getProjectIcon,
  getProjectManageMenuItems,
} from "@/utils";
import { generateProjectRoute } from "@/utils/helpers";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ProjectModal } from "./project-modal";

type Props = {
  project: ProjectWithProgress;
  canManage: boolean;
  dragHandle?: React.ReactNode;
};

export function ProjectCard({ project, canManage, dragHandle }: Props) {
  const t = useTranslations("projects");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { remove, isPending } = useDeleteProject();

  const { isFavorite, toggle: toggleFavorite } = useToggleProjectFavorite(
    project.id,
    project.isFavorite,
  );
  const { isCompleted, toggle: toggleCompleted } = useToggleProjectCompleted(
    project.id,
    project.isCompleted,
  );

  const items = getProjectManageMenuItems({
    canManage,
    isFavorite,
    onToggleFavorite: toggleFavorite,
    isCompleted,
    onToggleCompleted: toggleCompleted,
    onEdit: () => setEditOpen(true),
    onDelete: () => setDeleteOpen(true),
    t,
  });

  const ProjectIcon = getProjectIcon(project.icon);

  const handleDelete = async () => {
    await remove(project.id);
    setDeleteOpen(false);
  };

  return (
    <>
      <EntityCard
        href={generateProjectRoute(project.id)}
        title={project.name}
        dragHandle={dragHandle}
        icon={
          <ProjectIcon
            className={`h-4 w-4 shrink-0 ${getProjectColorTextClass(project.color)}`}
          />
        }
        badge={
          project.isPrivate ? (
            <Badge variant="outline" className="shrink-0 pointer-events-none">
              <Lock className="h-3 w-3 mr-1" />
              {t("private_badge")}
            </Badge>
          ) : undefined
        }
        description={project.description ?? undefined}
        actions={
          <ManageMenu
            disabled={isPending}
            triggerClassName="size-7"
            items={items}
          />
        }
        progress={{
          total: project.totalTasks,
          done: project.doneTasks,
          cancelled: project.cancelledTasks,
        }}
      />

      <ProjectModal
        workspaceId={project.workspaceId}
        project={project}
        open={editOpen}
        onOpenChange={setEditOpen}
        canManage={canManage}
      />

      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title={t("delete.confirm_title")}
        description={t("delete.confirm_description")}
        isPending={isPending}
        variant="destructive"
      />
    </>
  );
}
