"use client";

import { reorderFavoriteProjectsAction } from "@/actions/project/reorder-favorite-projects";
import { reorderProjectsAction } from "@/actions/project/reorder-projects";
import { reorderTaskListsAction } from "@/actions/task/reorder-task-lists";
import { AddProjectButton } from "@/components/projects/add-project-button";
import { ProjectModal } from "@/components/projects/project-modal";
import { TaskListModal } from "@/components/tasks/create-task-list-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  SidebarGroupAction,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { COOKIES, ERRORS, LINKS } from "@/const";
import { useCookieState } from "@/hooks/use-cookie-state";
import { useDeleteProject } from "@/hooks/use-delete-project";
import { useDeleteTaskList } from "@/hooks/use-delete-task-list";
import { usePathname } from "@/i18n/navigation";
import { ProjectWithProgress } from "@/types/dto";
import { cn, isActivePath, isActiveSubPath } from "@/utils";
import { generateProjectRoute } from "@/utils/helpers";
import { move } from "@dnd-kit/helpers";
import { type DragEndEvent } from "@dnd-kit/react";
import { FolderOpenDot, Plus, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useWorkspaces } from "../providers/workspace-provider";
import {
  ProjectSidebarActionsProvider,
  type ListTarget,
} from "./project-sidebar-context";
import { SidebarProjectSection } from "./sidebar-project-section";

const allProjectsKey = (projectId: string) => `all:${projectId}`;
const favoritesKey = (projectId: string) => `fav:${projectId}`;

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

  const handleListDragEnd = (projectId: string) => (event: DragEndEvent) => {
    if (event.canceled) return;

    const draggedId = event.operation.source?.id;
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

    const previousLists = project.lists;

    setTimeout(async () => {
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

      const revertLists = () =>
        setLocalProjects(prev =>
          prev.map(p =>
            p.id === projectId ? { ...p, lists: previousLists } : p,
          ),
        );

      try {
        const result = await reorderTaskListsAction(projectId, changes);
        if (result?.error) {
          revertLists();
          toast.error(
            result.error === ERRORS.INSUFFICIENT_ROLE
              ? t("common.insufficient_role")
              : t("common.unexpected_error"),
          );
          router.refresh();
        }
      } catch {
        revertLists();
        toast.error(t("common.unexpected_error"));
        router.refresh();
      }
    }, 0);
  };

  const commitProjectOrder = (
    previousOrder: ProjectWithProgress[],
    newIds: string[],
  ) => {
    if (!workspaceId) return;

    const oldPosition = new Map(previousOrder.map((p, index) => [p.id, index]));
    const changes = newIds
      .map((id, position) => ({ id, position }))
      .filter(({ id, position }) => oldPosition.get(id) !== position);

    if (changes.length === 0) return;

    setTimeout(async () => {
      setLocalProjects(prev => {
        const byId = new Map(prev.map(project => [project.id, project]));
        return newIds.map(id => byId.get(id)!);
      });

      try {
        const result = await reorderProjectsAction(workspaceId, changes);
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

  const handleProjectDragEnd = (event: DragEndEvent) => {
    if (event.canceled) return;

    const draggedId = event.operation.source?.id;
    if (!draggedId) return;

    const previousOrder = localProjects;
    const newIds = move(
      previousOrder.map(project => project.id),
      event,
    );

    commitProjectOrder(previousOrder, newIds);
  };

  const handleFavoriteDragEnd = (event: DragEndEvent) => {
    if (event.canceled) return;

    const draggedId = event.operation.source?.id;
    if (!draggedId) return;

    const previousOrder = localProjects;
    const favoriteIds = [...previousOrder]
      .filter(p => p.isFavorite)
      .sort((a, b) => (a.favoritePosition ?? 0) - (b.favoritePosition ?? 0))
      .map(p => p.id);
    const newFavoriteIds = move(favoriteIds, event);

    const oldPosition = new Map(favoriteIds.map((id, index) => [id, index]));
    const changes = newFavoriteIds
      .map((id, position) => ({ id, position }))
      .filter(({ id, position }) => oldPosition.get(id) !== position);

    if (changes.length === 0) return;

    setTimeout(async () => {
      const positionById = new Map(changes.map(c => [c.id, c.position]));
      setLocalProjects(prev =>
        prev.map(p =>
          positionById.has(p.id)
            ? { ...p, favoritePosition: positionById.get(p.id)! }
            : p,
        ),
      );

      try {
        const result = await reorderFavoriteProjectsAction(changes);
        if (result?.error) {
          setLocalProjects(previousOrder);
          toast.error(t("common.unexpected_error"));
          router.refresh();
        }
      } catch {
        setLocalProjects(previousOrder);
        toast.error(t("common.unexpected_error"));
        router.refresh();
      }
    }, 0);
  };

  const toggleProject = (key: string, open: boolean) => {
    const next = new Set(expandedIds);
    if (open) {
      next.add(key);
    } else {
      next.delete(key);
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

  const favoriteProjects = localProjects
    .filter(project => project.isFavorite)
    .sort((a, b) => (a.favoritePosition ?? 0) - (b.favoritePosition ?? 0));

  return (
    <ProjectSidebarActionsProvider
      value={{
        canManage,
        expandedIds,
        toggleExpanded: toggleProject,
        isActive,
        onLinkClick: () => setOpenMobile(false),
        onCreateList: setCreateListProjectId,
        onEditProject: setEditProject,
        onDeleteProject: setDeleteProject,
        onListDragEnd: handleListDragEnd,
        onRenameList: setRenameTarget,
        onDeleteList: setDeleteTarget,
      }}
    >
      {favoriteProjects.length > 0 && (
        <SidebarProjectSection
          header={
            <>
              <SidebarMenuButton asChild tooltip={t("sidebar.favorites")}>
                <Link
                  href={LINKS.PROJECTS_FAVORITES}
                  onClick={() => setOpenMobile(false)}
                  className={cn("pr-16", isActive(LINKS.PROJECTS_FAVORITES))}
                >
                  <Star className="mr-1" />
                  {t("sidebar.favorites")}
                </Link>
              </SidebarMenuButton>

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
            </>
          }
          projects={favoriteProjects}
          keyFor={favoritesKey}
          onDragEnd={handleFavoriteDragEnd}
          sectionKey="favorites"
        />
      )}

      <SidebarProjectSection
        header={
          <>
            {workspaces.length > 0 ? (
              <SidebarMenuButton asChild tooltip={t("sidebar.all_projects")}>
                <Link
                  href={LINKS.PROJECTS}
                  onClick={() => setOpenMobile(false)}
                  className={cn("pr-16", isActive(LINKS.PROJECTS))}
                >
                  <FolderOpenDot className="mr-1" />
                  {t("sidebar.all_projects")}
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
          </>
        }
        projects={localProjects}
        keyFor={allProjectsKey}
        onDragEnd={handleProjectDragEnd}
        sectionKey="all"
      />

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
    </ProjectSidebarActionsProvider>
  );
}
