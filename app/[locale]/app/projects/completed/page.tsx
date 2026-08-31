import { reorderProjectsAction } from "@/actions/project/reorder-projects";
import { ProjectsView } from "@/components/projects/projects-view";
import { NoWorkspaceBanner } from "@/components/workspaces/no-workspace-banner";
import { COOKIES, PROJECT_SORTS } from "@/const";
import {
  getActiveWorkspaceId,
  getCompletedProjects,
  getWorkspaceContext,
} from "@/lib/data";
import { parseCookieValue } from "@/utils/helpers";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

export default async function CompletedProjectsPage() {
  const cookieStore = await cookies();
  const activeWorkspaceId = await getActiveWorkspaceId();
  const defaultSort = parseCookieValue(
    cookieStore.get(COOKIES.PROJECT_SORT_COMPLETED)?.value,
    PROJECT_SORTS.CUSTOM,
  );

  if (!activeWorkspaceId) {
    return (
      <div className="mt-6">
        <NoWorkspaceBanner />
      </div>
    );
  }

  const [projects, { canEdit, canManage }, t] = await Promise.all([
    getCompletedProjects(activeWorkspaceId),
    getWorkspaceContext(activeWorkspaceId),
    getTranslations("projects"),
  ]);

  return (
    <ProjectsView
      projects={projects}
      canEdit={canEdit}
      isWorkspaceManager={canManage}
      canReorder={canEdit}
      defaultSort={defaultSort}
      sortCookieKey={COOKIES.PROJECT_SORT_COMPLETED}
      onReorder={reorderProjectsAction.bind(null, activeWorkspaceId)}
      title={t("title_completed")}
    />
  );
}
