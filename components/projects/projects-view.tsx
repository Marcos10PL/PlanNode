"use client";

import { SubHeader } from "@/components/sub-header";
import { SortSelect } from "@/components/ui/sort-select";
import { PROJECT_SORTS } from "@/const";
import { ProjectWithProgress } from "@/types/dto";
import { getProjectProgress } from "@/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { AddProjectButton } from "./add-project-button";
import { ProjectList } from "./project-list";

type ProjectSort = (typeof PROJECT_SORTS)[keyof typeof PROJECT_SORTS];

const SORTERS = {
  [PROJECT_SORTS.NEWEST]: projects => [...projects].reverse(),
  [PROJECT_SORTS.DATE]: projects => projects,
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
};

export function ProjectsView({ projects, canManage, workspaceId }: Props) {
  const t = useTranslations("projects");
  const [sort, setSort] = useState<ProjectSort>(PROJECT_SORTS.NEWEST);

  const sorted = SORTERS[sort](projects);

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

      <ProjectList projects={sorted} canManage={canManage} />
    </>
  );
}
