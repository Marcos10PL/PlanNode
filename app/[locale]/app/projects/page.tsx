import { reorderProjectsAction } from "@/actions/project/reorder-projects";
import { ProjectsView } from "@/components/projects/projects-view";
import { NoWorkspaceBanner } from "@/components/workspaces/no-workspace-banner";
import { COOKIES, PROJECT_SORTS } from "@/const";
import { getActiveProjects, getWorkspaceContext } from "@/lib/data";
import { parseCookieValue } from "@/utils/helpers";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

export default async function ProjectsPage() {
  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get(COOKIES.ACTIVE_WORKSPACE_ID)?.value;
  const defaultSort = parseCookieValue(
    cookieStore.get(COOKIES.PROJECT_SORT)?.value,
    PROJECT_SORTS.CUSTOM,
  );

  if (!activeWorkspaceId) {
    return (
      <div className="mt-6">
        <NoWorkspaceBanner />
      </div>
    );
  }

  const [projects, { canEdit }, t] = await Promise.all([
    getActiveProjects(activeWorkspaceId),
    getWorkspaceContext(activeWorkspaceId),
    getTranslations("projects"),
  ]);

  return (
    <ProjectsView
      projects={projects}
      canManage={canEdit}
      canReorder={canEdit}
      defaultSort={defaultSort}
      sortCookieKey={COOKIES.PROJECT_SORT}
      onReorder={reorderProjectsAction.bind(null, activeWorkspaceId)}
      title={t("title")}
    />
  );
}
