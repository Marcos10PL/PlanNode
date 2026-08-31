"use client";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ManageMenu } from "@/components/ui/manage-menu";
import { LINKS } from "@/const";
import { useDeleteProject } from "@/hooks/use-delete-project";
import { useToggleProjectCompleted } from "@/hooks/use-toggle-project-completed";
import { useToggleProjectFavorite } from "@/hooks/use-toggle-project-favorite";
import { Project } from "@/types/dto";
import { getProjectManageMenuItems } from "@/utils";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProjectModal } from "./project-modal";

type Props = {
  project: Project;
  canManage: boolean;
};

export function ProjectActions({ project, canManage }: Props) {
  const t = useTranslations();
  const tProjects = useTranslations("projects");
  const router = useRouter();
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
    t: tProjects,
  });

  const handleDelete = async () => {
    const deleted = await remove(project.id);
    if (deleted) router.push(LINKS.PROJECTS);
    setDeleteOpen(false);
  };

  return (
    <>
      <ManageMenu disabled={isPending} align="start" items={items} />

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
        title={t("projects.delete.confirm_title")}
        description={t("projects.delete.confirm_description")}
        isPending={isPending}
        variant="destructive"
      />
    </>
  );
}
