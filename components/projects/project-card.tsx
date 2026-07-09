"use client";

import { deleteProjectAction } from "@/actions/project/delete-project";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectWithProgress } from "@/types/dto";
import { getProjectProgress } from "@/utils";
import { generateProjectRoute } from "@/utils/helpers";
import { Lock, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { EditProjectModal } from "./edit-project-modal";

type Props = {
  project: ProjectWithProgress;
  canManage: boolean;
};

export function ProjectCard({ project, canManage }: Props) {
  const t = useTranslations("projects");
  const tCommon = useTranslations("common");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const progress = getProjectProgress(
    project.totalTasks,
    project.doneTasks,
    project.cancelledTasks,
  );

  const handleDelete = async () => {
    setIsPending(true);
    try {
      const result = await deleteProjectAction(project.id);
      if (result?.error) {
        toast.error(t("delete.error"));
      } else {
        toast.success(t("delete.success"));
      }
    } catch {
      toast.error(tCommon("unexpected_error"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
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
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={isPending}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
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
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{t("progress")}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-accent overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t("task_count", {
                done: project.doneTasks,
                total: project.totalTasks - project.cancelledTasks,
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <EditProjectModal
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
