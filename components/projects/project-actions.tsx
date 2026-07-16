"use client";

import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ManageMenu } from "@/components/ui/manage-menu";
import { LINKS } from "@/const";
import { useDeleteProject } from "@/hooks/use-delete-project";
import { Project } from "@/types/dto";
import { Pencil, Trash2 } from "lucide-react";
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
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { remove, isPending } = useDeleteProject();

  const handleDelete = async () => {
    const deleted = await remove(project.id);
    if (deleted) router.push(LINKS.PROJECTS);
    setDeleteOpen(false);
  };

  if (!canManage) return null;

  return (
    <>
      <ManageMenu
        disabled={isPending}
        align="start"
        items={[
          {
            label: t("projects.edit.trigger"),
            icon: Pencil,
            onClick: () => setEditOpen(true),
          },
          {
            label: t("projects.delete.trigger"),
            icon: Trash2,
            onClick: () => setDeleteOpen(true),
            destructive: true,
          },
        ]}
      />

      <ProjectModal
        workspaceId={project.workspaceId}
        project={project}
        open={editOpen}
        onOpenChange={setEditOpen}
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
