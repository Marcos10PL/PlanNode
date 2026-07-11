"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskProgress } from "@/components/ui/task-progress";
import { useDeleteProject } from "@/hooks/use-delete-project";
import { ProjectWithProgress } from "@/types/dto";
import { getProjectColorTextClass, getProjectIcon } from "@/utils";
import { generateProjectRoute } from "@/utils/helpers";
import { Lock, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { ProjectModal } from "./project-modal";

type Props = {
  project: ProjectWithProgress;
  canManage: boolean;
};

export function ProjectCard({ project, canManage }: Props) {
  const t = useTranslations("projects");
  const tCommon = useTranslations("common");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { remove, isPending } = useDeleteProject();

  const ProjectIcon = getProjectIcon(project.icon);

  const handleDelete = async () => {
    await remove(project.id);
    setDeleteOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ProjectIcon
              className={`h-4 w-4 shrink-0 ${getProjectColorTextClass(project.color)}`}
            />
            <CardTitle className="flex-1 min-w-0">
              <Link
                href={generateProjectRoute(project.id)}
                className="hover:underline line-clamp-1"
              >
                {project.name}
              </Link>
            </CardTitle>
            {project.isPrivate && (
              <Badge variant="outline" className="shrink-0 pointer-events-none">
                <Lock className="h-3 w-3 mr-1" />
                {t("private_badge")}
              </Badge>
            )}
            {canManage && (
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={isPending}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>{tCommon("manage")}</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t("edit.trigger")}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("delete.trigger")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}
          <TaskProgress
            total={project.totalTasks}
            done={project.doneTasks}
            cancelled={project.cancelledTasks}
            showLabel
          />
        </CardContent>
      </Card>

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
        title={t("delete.confirm_title")}
        description={t("delete.confirm_description")}
        isPending={isPending}
        variant="destructive"
      />
    </>
  );
}
