"use client";

import { SubHeader } from "@/components/sub-header";
import { SortSelect } from "@/components/ui/sort-select";
import { PROJECT_SORTS } from "@/const";
import { useCookieState } from "@/hooks/use-cookie-state";
import { ReorderAction } from "@/types";
import { ProjectWithProgress } from "@/types/dto";
import { getProjectProgress } from "@/utils";
import { useTranslations } from "next-intl";
import { ProjectList } from "./project-list";

type ProjectSort = (typeof PROJECT_SORTS)[keyof typeof PROJECT_SORTS];

const SORTERS = {
  [PROJECT_SORTS.CUSTOM]: projects => projects,
  [PROJECT_SORTS.NEWEST]: projects =>
    [...projects].sort((a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
    ),
  [PROJECT_SORTS.DATE]: projects =>
    [...projects].sort((a, b) =>
      (a.createdAt ?? "").localeCompare(b.createdAt ?? ""),
    ),
  [PROJECT_SORTS.NAME]: projects =>
    [...projects].sort((a, b) => a.name.localeCompare(b.name)),
  [PROJECT_SORTS.PROGRESS]: projects =>
    [...projects].sort(
      (a, b) =>
        getProjectProgress(a.totalTasks, a.doneTasks, a.cancelledTasks) -
        getProjectProgress(b.totalTasks, b.doneTasks, b.cancelledTasks),
    ),
} as const satisfies Record<
  ProjectSort,
  (projects: ProjectWithProgress[]) => ProjectWithProgress[]
>;

type Props = {
  projects: ProjectWithProgress[];
  canEdit: boolean;
  isWorkspaceManager?: boolean;
  canReorder: boolean;
  defaultSort: ProjectSort;
  sortCookieKey: string;
  onReorder: ReorderAction;
  title: string;
};

export function ProjectsView({
  projects,
  canEdit,
  isWorkspaceManager,
  canReorder,
  defaultSort,
  sortCookieKey,
  onReorder,
  title,
}: Props) {
  const t = useTranslations("projects");
  const [sort, setSort] = useCookieState<ProjectSort>(
    sortCookieKey,
    defaultSort,
  );

  const sorted = SORTERS[sort](projects);
  const dragEnabled = canReorder && sort === PROJECT_SORTS.CUSTOM;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center gap-2 mt-4 mb-6 justify-between">
        <div className="flex items-center gap-2">
          <SubHeader title={title} className="my-1" />
          <span className="text-sm text-muted-foreground">
            {projects.length}
          </span>
        </div>
        {projects.length > 1 && (
          <SortSelect
            value={sort}
            onChange={setSort}
            options={Object.values(PROJECT_SORTS)}
            getLabel={s => t(`sort.${s}`)}
          />
        )}
      </div>

      <ProjectList
        projects={sorted}
        canEdit={canEdit}
        isWorkspaceManager={isWorkspaceManager}
        onReorder={onReorder}
        dragEnabled={dragEnabled}
      />
    </>
  );
}
