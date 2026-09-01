"use client";

import { getMoreTrashedProjectsAction } from "@/actions/project/get-more-trashed-projects";
import { permanentlyClearProjectsTrashAction } from "@/actions/project/permanently-clear-projects-trash";
import { SubHeader } from "@/components/sub-header";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { SortSelect } from "@/components/ui/sort-select";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { COOKIES, TRASH_SORTS, TrashSort } from "@/const";
import { useCookieState } from "@/hooks/use-cookie-state";
import { usePermanentlyDeleteProject } from "@/hooks/use-permanently-delete-project";
import { useRestoreProject } from "@/hooks/use-restore-project";
import { ProjectWithProgress } from "@/types/dto";
import { getProjectColorTextClass, getProjectIcon } from "@/utils";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TrashItemRow } from "./trash-item-row";

type Props = {
  workspaceId: string;
  title: string;
  initialProjects: ProjectWithProgress[];
  initialHasMore: boolean;
  initialSort: TrashSort;
  canEdit?: boolean;
  isWorkspaceManager?: boolean;
};

export function ProjectTrashList({
  workspaceId,
  title,
  initialProjects,
  initialHasMore,
  initialSort,
  canEdit,
  isWorkspaceManager,
}: Props) {
  const t = useTranslations("projects");
  const tCommon = useTranslations("common");

  const [sort, setSort] = useCookieState<TrashSort>(
    COOKIES.PROJECTS_TRASH_SORT,
    initialSort,
  );
  const [projects, setProjects] = useState(initialProjects);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const [deleteTarget, setDeleteTarget] = useState<ProjectWithProgress | null>(
    null,
  );
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  const { restore, isPending: isRestorePending } = useRestoreProject();
  const { remove, isPending: isDeletePending } = usePermanentlyDeleteProject();

  useEffect(() => {
    setProjects(initialProjects);
    setHasMore(initialHasMore);
  }, [initialProjects, initialHasMore]);

  const handleSortChange = async (next: TrashSort) => {
    setSort(next);
    setIsLoading(true);
    try {
      const result = await getMoreTrashedProjectsAction(workspaceId, next, 0);
      setProjects(result.projects);
      setHasMore(result.hasMore);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || loadingRef.current) return;

        loadingRef.current = true;
        setIsLoading(true);
        try {
          const result = await getMoreTrashedProjectsAction(
            workspaceId,
            sort,
            projects.length,
          );
          setProjects(prev => [...prev, ...result.projects]);
          setHasMore(result.hasMore);
        } finally {
          loadingRef.current = false;
          setIsLoading(false);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, projects.length, sort, workspaceId]);

  const handleRestore = async (project: ProjectWithProgress) => {
    const ok = await restore(project.id);
    if (ok) setProjects(prev => prev.filter(p => p.id !== project.id));
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const ok = await remove(deleteTarget.id);
    if (ok) setProjects(prev => prev.filter(p => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleClearAll = async () => {
    setIsClearingAll(true);
    try {
      const result = await permanentlyClearProjectsTrashAction(workspaceId);
      if (result?.error) {
        toast.error(t("trash.clear_all.error"));
      } else {
        toast.success(t("trash.clear_all.success"));
      }
    } catch {
      toast.error(t("trash.clear_all.error"));
    } finally {
      setIsClearingAll(false);
      setClearAllOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center gap-2 mt-4 mb-6 justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <SubHeader title={title} className="my-1" />
          {isWorkspaceManager && projects.length > 0 && (
            <TooltipIconButton
              icon={Trash2}
              label={t("trash.clear_all.trigger")}
              onClick={() => setClearAllOpen(true)}
              className="text-destructive shrink-0"
            />
          )}
        </div>
        <div className="self-end md:self-auto">
          <SortSelect
            value={sort}
            onChange={handleSortChange}
            options={Object.values(TRASH_SORTS)}
            getLabel={s => t(`trash.sort.${s}`)}
          />
        </div>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {projects.map(project => {
            const ProjectIcon = getProjectIcon(project.icon);
            return (
              <TrashItemRow
                key={project.id}
                icon={
                  <ProjectIcon
                    className={`h-4 w-4 shrink-0 ${getProjectColorTextClass(project.color)}`}
                  />
                }
                title={project.name}
                deletedAt={project.deletedAt}
                onRestore={() => handleRestore(project)}
                isRestorePending={isRestorePending}
                canRestore={canEdit}
                canDelete={isWorkspaceManager}
                onDelete={() => setDeleteTarget(project)}
                isDeletePending={isDeletePending}
              />
            );
          })}

          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-2">
              {isLoading && (
                <span className="text-xs text-muted-foreground">
                  {tCommon("loading_more")}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={o => !o && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={t("trash.delete_permanently.confirm_title")}
        description={t("trash.delete_permanently.confirm_description")}
        isPending={isDeletePending}
        variant="destructive"
      />

      <ConfirmModal
        open={clearAllOpen}
        onOpenChange={setClearAllOpen}
        onConfirm={handleClearAll}
        title={t("trash.clear_all.confirm_title")}
        description={t("trash.clear_all.confirm_description")}
        isPending={isClearingAll}
        variant="destructive"
      />
    </>
  );
}
