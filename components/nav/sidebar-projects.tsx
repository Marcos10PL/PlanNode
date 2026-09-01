"use client";

import { reorderFavoriteProjectsAction } from "@/actions/project/reorder-favorite-projects";
import { reorderProjectsAction } from "@/actions/project/reorder-projects";
import { reorderTaskListsAction } from "@/actions/task/reorder-task-lists";
import { ProjectModal } from "@/components/projects/project-modal";
import { TaskListModal } from "@/components/tasks/create-task-list-modal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  SidebarGroup,
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
import { CheckCircle2, FolderOpenDot, Plus, Star, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useWorkspaces } from "../providers/workspace-provider";
import { SectionSeparator } from "../ui/section-separator";
import {
  ProjectSidebarActionsProvider,
  type ListTarget,
} from "./project-sidebar-context";
import { SidebarProjectSection } from "./sidebar-project-section";

const favoritesKey = (projectId: string) => `fav:${projectId}`;
const activeKey = (projectId: string) => `active:${projectId}`;
const completedKey = (projectId: string) => `done:${projectId}`;

type Props = {
  projects: ProjectWithProgress[];
  workspaceId: string | null;
  canEdit: boolean;
  isWorkspaceManager?: boolean;
  defaultExpandedProjectIds: string[];
};

export function SidebarProjects({
  projects,
  workspaceId,
  canEdit,
  isWorkspaceManager,
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
  const [addProjectOpen, setAddProjectOpen] = useState(false);

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

  const reorderPositionSubset = (
    event: DragEndEvent,
    predicate: (project: ProjectWithProgress) => boolean,
  ) => {
    const draggedId = event.operation.source?.id;
    if (event.canceled || !draggedId) return null;

    const previousOrder = localProjects;
    const subsetIds = previousOrder.filter(predicate).map(p => p.id);
    const newSubsetIds = move(subsetIds, event);

    const oldPosition = new Map(subsetIds.map((id, index) => [id, index]));
    const changes = newSubsetIds
      .map((id, position) => ({ id, position }))
      .filter(({ id, position }) => oldPosition.get(id) !== position);

    if (changes.length === 0) return null;

    const byId = new Map(previousOrder.map(project => [project.id, project]));
    const reorderedSubset = newSubsetIds.map(id => byId.get(id)!);
    let index = 0;
    const nextOrder = previousOrder.map(project =>
      predicate(project) ? reorderedSubset[index++] : project,
    );

    return { previousOrder, nextOrder, changes };
  };

  const commitPositionReorder = (
    previousOrder: ProjectWithProgress[],
    nextOrder: ProjectWithProgress[],
    changes: { id: string; position: number }[],
  ) => {
    if (!workspaceId) return;

    setTimeout(async () => {
      setLocalProjects(nextOrder);

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

  const handlePositionDragEnd =
    (predicate: (project: ProjectWithProgress) => boolean) =>
    (event: DragEndEvent) => {
      const result = reorderPositionSubset(event, predicate);
      if (!result) return;
      commitPositionReorder(
        result.previousOrder,
        result.nextOrder,
        result.changes,
      );
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

  const activeProjects = localProjects.filter(project => !project.isCompleted);
  const completedProjects = localProjects.filter(
    project => project.isCompleted,
  );

  return (
    <ProjectSidebarActionsProvider
      value={{
        canEdit,
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
      {workspaces.length === 0 ? (
        <div className="text-sm px-2 italic text-muted-foreground group-data-[collapsible=icon]:hidden">
          {t("sidebar.no_workspaces")}
        </div>
      ) : (
        <>
          {canEdit && workspaceId && (
            <SidebarGroup className="-mt-4">
              <SidebarMenuButton
                className="cursor-pointer text-nowrap"
                variant="outline"
                tooltip={t("projects.create.trigger")}
                onClick={() => setAddProjectOpen(true)}
              >
                <Plus className="mr-1" />
                {t("projects.create.trigger")}
              </SidebarMenuButton>
            </SidebarGroup>
          )}

          <SidebarProjectSection
            href={LINKS.PROJECTS_FAVORITES}
            label={t("sidebar.favorites")}
            icon={Star}
            projects={favoriteProjects}
            keyFor={favoritesKey}
            onDragEnd={handleFavoriteDragEnd}
            sectionKey="favorites"
            emptyMessage={t("sidebar.empty_favorites")}
          />

          <SidebarProjectSection
            href={LINKS.PROJECTS}
            label={t("sidebar.all_projects")}
            icon={FolderOpenDot}
            projects={activeProjects}
            keyFor={activeKey}
            onDragEnd={handlePositionDragEnd(p => !p.isCompleted)}
            sectionKey="active"
            emptyMessage={t("sidebar.empty_active")}
          />

          <SidebarProjectSection
            href={LINKS.PROJECTS_COMPLETED}
            label={t("sidebar.completed")}
            icon={CheckCircle2}
            projects={completedProjects}
            keyFor={completedKey}
            onDragEnd={handlePositionDragEnd(p => p.isCompleted)}
            sectionKey="completed"
            emptyMessage={t("sidebar.empty_completed")}
          />

          <SectionSeparator className="mb-1" />

          <SidebarGroup>
            <SidebarMenuButton asChild tooltip={t("sidebar.trash")}>
              <Link
                href={LINKS.PROJECTS_TRASH}
                className={cn(isActive(LINKS.PROJECTS_TRASH))}
                onClick={() => setOpenMobile(false)}
              >
                <Trash2 className="mr-1" />
                {t("sidebar.trash")}
              </Link>
            </SidebarMenuButton>
          </SidebarGroup>
        </>
      )}

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
          isWorkspaceManager={isWorkspaceManager}
        />
      )}

      {workspaceId && (
        <ProjectModal
          workspaceId={workspaceId}
          open={addProjectOpen}
          onOpenChange={setAddProjectOpen}
          isWorkspaceManager={isWorkspaceManager}
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
