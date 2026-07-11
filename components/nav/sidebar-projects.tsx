"use client";

import { ProjectModal } from "@/components/projects/project-modal";
import { TaskListModal } from "@/components/tasks/create-task-list-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LINKS } from "@/const";
import { useDeleteProject } from "@/hooks/use-delete-project";
import { useDeleteTaskList } from "@/hooks/use-delete-task-list";
import { usePathname } from "@/i18n/navigation";
import { ProjectListSummary, ProjectWithProgress } from "@/types/dto";
import {
  cn,
  getProjectColorBorderClass,
  getProjectColorTextClass,
  getProjectIcon,
  isActivePath,
  isActiveSubPath,
} from "@/utils";
import { generateListRoute, generateProjectRoute } from "@/utils/helpers";
import {
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ListTarget = {
  projectId: string;
  list: ProjectListSummary;
};

type Props = {
  projects: ProjectWithProgress[];
  workspaceId: string | null;
  canManage: boolean;
};

export function SidebarProjects({ projects, workspaceId, canManage }: Props) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  const [renameTarget, setRenameTarget] = useState<ListTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ListTarget | null>(null);
  const [createListProjectId, setCreateListProjectId] = useState<string | null>(
    null,
  );
  const [editProject, setEditProject] = useState<ProjectWithProgress | null>(
    null,
  );
  const [deleteProject, setDeleteProject] =
    useState<ProjectWithProgress | null>(null);

  const { remove: removeList, isPending: listPending } = useDeleteTaskList();
  const { remove: removeProject, isPending: projectPending } =
    useDeleteProject();

  const handleDeleteList = async () => {
    if (!deleteTarget) return;

    await removeList(deleteTarget.list.id);
    setDeleteTarget(null);
  };

  const handleDeleteProject = async () => {
    if (!deleteProject) return;

    const deleted = await removeProject(deleteProject.id);
    if (
      deleted &&
      isActiveSubPath(pathname, generateProjectRoute(deleteProject.id))
    ) {
      router.push(LINKS.PROJECTS);
    }
    setDeleteProject(null);
  };

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <Link href={LINKS.PROJECTS} onClick={() => setOpenMobile(false)}>
            {t("sidebar.projects")}
          </Link>
        </SidebarGroupLabel>
        {canManage && workspaceId && (
          <ProjectModal
            workspaceId={workspaceId}
            trigger={
              <SidebarGroupAction title={t("projects.create.trigger")}>
                <Plus />
              </SidebarGroupAction>
            }
          />
        )}
        <SidebarMenu>
          {projects.map(project => {
            const projectRoute = generateProjectRoute(project.id);
            const ProjectIcon = getProjectIcon(project.icon);

            return (
              <Collapsible
                key={project.id}
                defaultOpen={isActiveSubPath(pathname, projectRoute)}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip={project.name}>
                    <Link
                      href={projectRoute}
                      className={cn(
                        "group-hover/menu-item:pr-22! group-has-[.row-menu[data-state=open]]/menu-item:pr-22!",
                        isActivePath(pathname, projectRoute) &&
                          "bg-accent text-accent-foreground",
                      )}
                      onClick={() => setOpenMobile(false)}
                    >
                      <ProjectIcon
                        className={`mr-2 ${getProjectColorTextClass(project.color)}`}
                      />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  <div className="absolute right-1 top-0 flex h-8 items-center">
                    {canManage && (
                      <>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuAction
                              className="static aspect-auto h-7 w-7 cursor-pointer opacity-0 group-hover/menu-item:opacity-100 hover:bg-foreground/20"
                              onClick={() => setCreateListProjectId(project.id)}
                            >
                              <Plus />
                            </SidebarMenuAction>
                          </TooltipTrigger>
                          <TooltipContent>
                            {t("tasks.list_create.trigger")}
                          </TooltipContent>
                        </Tooltip>
                        <DropdownMenu>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuAction className="row-menu static aspect-auto h-7 w-7 cursor-pointer opacity-0 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 hover:bg-foreground/20">
                                  <MoreHorizontal />
                                </SidebarMenuAction>
                              </DropdownMenuTrigger>
                            </TooltipTrigger>
                            <TooltipContent>{t("common.manage")}</TooltipContent>
                          </Tooltip>
                          <DropdownMenuContent align="start" side="right">
                            <DropdownMenuItem
                              onClick={() => setEditProject(project)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              {t("projects.edit.trigger")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteProject(project)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("projects.delete.trigger")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </>
                    )}
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="static aspect-auto h-7 w-7 cursor-pointer hover:bg-foreground/20 [&>svg]:transition-transform group-data-[state=open]/collapsible:[&>svg]:rotate-90">
                        <ChevronRight />
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent>
                    <SidebarMenuSub
                      className={cn(
                        "mr-0 pr-0",
                        getProjectColorBorderClass(project.color),
                      )}
                    >
                      {project.lists.map(list => {
                        const listRoute = generateListRoute(
                          project.id,
                          list.id,
                        );

                        return (
                          <SidebarMenuSubItem
                            key={list.id}
                            className="group/list"
                          >
                            <SidebarMenuSubButton
                              asChild
                              isActive={isActivePath(pathname, listRoute)}
                              className="group-hover/list:pr-7 group-has-data-[state=open]/list:pr-7"
                            >
                              <Link
                                href={listRoute}
                                onClick={() => setOpenMobile(false)}
                              >
                                <span className="flex-1 truncate">
                                  {list.name}
                                </span>
                                <span className="text-xs text-muted-foreground group-hover/list:opacity-0 group-has-data-[state=open]/list:opacity-0">
                                  {list.taskCount}
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                            {canManage && (
                            <DropdownMenu>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                    <SidebarMenuAction className="top-0 h-full aspect-auto w-6 cursor-pointer opacity-0 group-hover/list:opacity-100 data-[state=open]:opacity-100 hover:bg-foreground/20">
                                      <MoreHorizontal />
                                    </SidebarMenuAction>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {t("common.manage")}
                                </TooltipContent>
                              </Tooltip>
                              <DropdownMenuContent align="start" side="right">
                                <DropdownMenuItem
                                  onClick={() =>
                                    setRenameTarget({
                                      projectId: project.id,
                                      list,
                                    })
                                  }
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  {t("tasks.list_rename.trigger")}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() =>
                                    setDeleteTarget({
                                      projectId: project.id,
                                      list,
                                    })
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t("tasks.list_delete.trigger")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            )}
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>

      <TaskListModal
        projectId={renameTarget?.projectId ?? ""}
        list={renameTarget?.list}
        open={!!renameTarget}
        onOpenChange={o => !o && setRenameTarget(null)}
      />

      <TaskListModal
        projectId={createListProjectId ?? ""}
        open={!!createListProjectId}
        onOpenChange={o => !o && setCreateListProjectId(null)}
      />

      {editProject && (
        <ProjectModal
          workspaceId={editProject.workspaceId}
          project={editProject}
          open={!!editProject}
          onOpenChange={o => !o && setEditProject(null)}
        />
      )}

      <ConfirmModal
        open={!!deleteProject}
        onOpenChange={o => !o && setDeleteProject(null)}
        onConfirm={handleDeleteProject}
        title={t("projects.delete.confirm_title")}
        description={t("projects.delete.confirm_description")}
        isPending={projectPending}
        variant="destructive"
      />

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={o => !o && setDeleteTarget(null)}
        onConfirm={handleDeleteList}
        title={t("tasks.list_delete.confirm_title")}
        description={t("tasks.list_delete.confirm_description")}
        isPending={listPending}
        variant="destructive"
      />
    </>
  );
}
