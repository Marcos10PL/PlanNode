"use client";

import { deleteProjectAction } from "@/actions/project/delete-project";
import { TaskListModal } from "@/components/tasks/create-task-list-modal";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LINKS } from "@/const";
import { Project, WorkspaceMember } from "@/types/dto";
import { MoreHorizontal, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { EditProjectModal } from "./edit-project-modal";
import { ManageProjectMembersModal } from "./manage-project-members-modal";

type Props = {
  project: Project;
  members: WorkspaceMember[];
  memberIds: string[];
  canManage: boolean;
};

export function ProjectActions({
  project,
  members,
  memberIds,
  canManage,
}: Props) {
  const t = useTranslations();
  const router = useRouter();
  const [addListOpen, setAddListOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    setIsPending(true);
    try {
      const result = await deleteProjectAction(project.id);
      if (result?.error) {
        toast.error(t("projects.delete.error"));
        setIsPending(false);
        return;
      }

      toast.success(t("projects.delete.success"));
      router.push(LINKS.PROJECTS);
    } catch {
      toast.error(t("common.unexpected_error"));
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => setAddListOpen(true)}>
        <Plus className="h-4 w-4 mr-1" />
        {t("tasks.list_create.trigger")}
      </Button>

      {canManage && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isPending}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              {t("projects.edit.trigger")}
            </DropdownMenuItem>
            {project.isPrivate && (
              <DropdownMenuItem onClick={() => setMembersOpen(true)}>
                <Users className="mr-2 h-4 w-4" />
                {t("projects.members.trigger")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("projects.delete.trigger")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <TaskListModal
        projectId={project.id}
        open={addListOpen}
        onOpenChange={setAddListOpen}
      />

      <EditProjectModal
        project={project}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <ManageProjectMembersModal
        projectId={project.id}
        members={members}
        memberIds={memberIds}
        open={membersOpen}
        onOpenChange={setMembersOpen}
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
    </div>
  );
}
