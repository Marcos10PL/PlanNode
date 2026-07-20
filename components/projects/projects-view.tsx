"use client";

import { SubHeader } from "@/components/sub-header";
import { SortSelect } from "@/components/ui/sort-select";
import { COOKIES, PROJECT_SORTS } from "@/const";
import { useCookieState } from "@/hooks/use-cookie-state";
import { ProjectWithProgress } from "@/types/dto";
import { getProjectProgress } from "@/utils";
import { useTranslations } from "next-intl";
import { AddProjectButton } from "./add-project-button";
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
  canManage: boolean;
  workspaceId: string;
  defaultSort: ProjectSort;
};

export function ProjectsView({
  projects,
  canManage,
  workspaceId,
  defaultSort,
}: Props) {
  const t = useTranslations("projects");
  const [sort, setSort] = useCookieState<ProjectSort>(
    COOKIES.PROJECT_SORT,
    defaultSort,
  );

  const sorted = SORTERS[sort](projects);
  const dragEnabled = canManage && sort === PROJECT_SORTS.CUSTOM;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center gap-2 mt-4 mb-6 justify-between">
        <div className="flex items-center gap-2">
          <SubHeader
            title={`${t("title")} (${projects.length})`}
            className="my-0"
          />
          {canManage && <AddProjectButton workspaceId={workspaceId} />}
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
        canManage={canManage}
        workspaceId={workspaceId}
        dragEnabled={dragEnabled}
      />
    </>
  );
}
