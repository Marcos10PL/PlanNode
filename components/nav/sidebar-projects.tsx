"use client";

import { reorderProjectsAction } from "@/actions/project/reorder-projects";
import { reorderTaskListsAction } from "@/actions/task/reorder-task-lists";
import { AddProjectButton } from "@/components/projects/add-project-button";
import { ProjectModal } from "@/components/projects/project-modal";
import { TaskListModal } from "@/components/tasks/create-task-list-modal";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarMenu,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { COOKIES, LINKS } from "@/const";
import { useCookieState } from "@/hooks/use-cookie-state";
import { useDeleteProject } from "@/hooks/use-delete-project";
import { useDeleteTaskList } from "@/hooks/use-delete-task-list";
import { usePathname } from "@/i18n/navigation";
import { ProjectListSummary, ProjectWithProgress } from "@/types/dto";
import { cn, isActivePath, isActiveSubPath } from "@/utils";
import { generateProjectRoute } from "@/utils/helpers";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { ChevronRight, FolderOpenDot, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWorkspaces } from "../providers/workspace-provider";
import { SortableSidebarProjectItem } from "./sortable-sidebar-project-item";

type ListTarget = {
  projectId: string;
  list: ProjectListSummary;
};

type Props = {
  projects: ProjectWithProgress[];
  workspaceId: string | null;
  canManage: boolean;
  defaultExpandedProjectIds: string[];
};

export function SidebarProjects({
  projects,
  workspaceId,
  canManage,
  defaultExpandedProjectIds,
}: Props) {
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

  const { workspaces } = useWorkspaces();

  const [expandedIds, setExpandedIds] = useCookieState<string[]>(
    COOKIES.SIDEBAR_EXPANDED_PROJECTS,
    defaultExpandedProjectIds,
  );

  const [localProjects, setLocalProjects] = useState(projects);

  useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);

  useEffect(() => {
    const activeProject = projects.find(project =>
      isActiveSubPath(pathname, generateProjectRoute(project.id)),
    );
    if (!activeProject) return;

    setExpandedIds(prev =>
      prev.includes(activeProject.id) ? prev : [...prev, activeProject.id],
    );
  }, [pathname]);

  const handleListDragEnd = (projectId: string) => (event: DragEndEvent) => {
    if (event.canceled) return;

    const draggedId = event.operation.source?.id as string | undefined;
    if (!draggedId) return;

    const project = localProjects.find(p => p.id === projectId);
    if (!project) return;

    const ids = project.lists.map(list => list.id);
    const movedIds = move(ids, event);

    const oldPosition = new Map(ids.map((id, index) => [id, index]));
    const changes = movedIds
      .map((id, position) => ({ id, position }))
      .filter(({ id, position }) => oldPosition.get(id) !== position);

    if (changes.length === 0) return;

    setTimeout(() => {
      setLocalProjects(prev =>
        prev.map(p =>
          p.id === projectId
            ? {
                ...p,
                lists: movedIds.map(
                  id => project.lists.find(list => list.id === id)!,
                ),
              }
            : p,
        ),
      );
      reorderTaskListsAction(projectId, changes);
    }, 0);
  };

  const handleProjectDragEnd = (event: DragEndEvent) => {
    if (event.canceled) return;

    const draggedId = event.operation.source?.id as string | undefined;
    if (!draggedId || !workspaceId) return;

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

  const toggleProject = (projectId: string, open: boolean) => {
    const next = new Set(expandedIds);
    if (open) {
      next.add(projectId);
    } else {
      next.delete(projectId);
    }
    setExpandedIds([...next]);
  };

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

  const isActive = (href: string) =>
    isActivePath(pathname, href) && "bg-accent text-accent-foreground";

  return (
    <>
      <Collapsible defaultOpen className="group/projects-section">
        <SidebarGroup className="-mt-4">
          {workspaces.length > 0 ? (
            <SidebarMenuButton asChild tooltip={t("sidebar.projects")}>
              <Link
                href={LINKS.PROJECTS}
                onClick={() => setOpenMobile(false)}
                className={cn("pr-16", isActive(LINKS.PROJECTS))}
              >
                <FolderOpenDot className="mr-1" />
                {t("sidebar.projects")}
              </Link>
            </SidebarMenuButton>
          ) : (
            <div className="text-sm px-2 -mt-1.5 italic text-muted-foreground group-data-[collapsible=icon]:hidden">
              {t("sidebar.no_workspaces")}
            </div>
          )}

          {canManage && workspaceId && (
            <AddProjectButton
              workspaceId={workspaceId}
              trigger={
                <SidebarGroupAction className="right-10 top-2.5 aspect-auto h-7 w-7 cursor-pointer hover:bg-foreground/20">
                  <Plus />
                </SidebarGroupAction>
              }
            />
          )}

          {workspaces.length > 0 && (
            <CollapsibleTrigger asChild>
              <SidebarGroupAction className="right-3 top-2.5 aspect-auto h-7 w-7 cursor-pointer hover:bg-foreground/20 [&>svg]:transition-transform group-data-[state=open]/projects-section:[&>svg]:rotate-90">
                <ChevronRight />
              </SidebarGroupAction>
            </CollapsibleTrigger>
          )}

          <CollapsibleContent>
            <DragDropProvider onDragEnd={handleProjectDragEnd}>
              <SidebarMenu className="ml-3.5 w-auto translate-x-px border-l dark:border-white/20 pl-2 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:border-l-0 group-data-[collapsible=icon]:pl-0 pt-1">
                {localProjects.map((project, index) => (
                  <SortableSidebarProjectItem
                    key={project.id}
                    project={project}
                    index={index}
                    isActive={!!isActive(generateProjectRoute(project.id))}
                    isExpanded={expandedIds.includes(project.id)}
                    canManage={canManage}
                    dragEnabled={canManage}
                    onToggle={toggleProject}
                    onLinkClick={() => setOpenMobile(false)}
                    onCreateList={setCreateListProjectId}
                    onEditProject={setEditProject}
                    onDeleteProject={setDeleteProject}
                    onListDragEnd={handleListDragEnd}
                    onRenameList={setRenameTarget}
                    onDeleteList={setDeleteTarget}
                  />
                ))}
              </SidebarMenu>
            </DragDropProvider>
          </CollapsibleContent>
        </SidebarGroup>
      </Collapsible>

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
