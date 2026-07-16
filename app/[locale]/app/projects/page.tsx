import { AddProjectButton } from "@/components/projects/add-project-button";
import { ProjectList } from "@/components/projects/project-list";
import { ProjectSortSelect } from "@/components/projects/project-sort-select";
import { SubHeader } from "@/components/sub-header";
import { NoWorkspaceBanner } from "@/components/workspaces/no-workspace-banner";
import { COOKIES, PROJECT_SORTS } from "@/const";
import { getProjects, getWorkspaceContext } from "@/lib/data";
import { ProjectWithProgress } from "@/types/dto";
import { getProjectProgress } from "@/utils";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

type Props = {
  searchParams: Promise<{ sort?: string }>;
};

const sortProjects = (projects: ProjectWithProgress[], sort?: string) => {
  switch (sort) {
    case PROJECT_SORTS.DATE:
      return projects;
    case PROJECT_SORTS.NAME:
      return [...projects].sort((a, b) => a.name.localeCompare(b.name));
    case PROJECT_SORTS.PROGRESS:
      return [...projects].sort(
        (a, b) =>
          getProjectProgress(a.totalTasks, a.doneTasks, a.cancelledTasks) -
          getProjectProgress(b.totalTasks, b.doneTasks, b.cancelledTasks),
      );
    default:
      return [...projects].reverse();
  }
};

export default async function ProjectsPage({ searchParams }: Props) {
  const t = await getTranslations("projects");
  const { sort } = await searchParams;

  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get(COOKIES.ACTIVE_WORKSPACE_ID)?.value;

  if (!activeWorkspaceId) {
    return (
      <div className="mt-6">
        <NoWorkspaceBanner />
      </div>
    );
  }

  const [projects, { canEdit }] = await Promise.all([
    getProjects(activeWorkspaceId),
    getWorkspaceContext(activeWorkspaceId),
  ]);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center gap-2 mt-4 mb-6">
        <div className="flex items-center gap-2">
          <SubHeader
            title={`${t("title")} (${projects.length})`}
            className="my-0"
          />
          {canEdit && <AddProjectButton workspaceId={activeWorkspaceId} />}
        </div>
        {projects.length > 1 && (
          <div className="w-full md:w-32">
            <ProjectSortSelect />
          </div>
        )}
      </div>

      <ProjectList
        projects={sortProjects(projects, sort)}
        canManage={canEdit}
      />
    </>
  );
}
