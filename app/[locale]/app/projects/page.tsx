import { ProjectsView } from "@/components/projects/projects-view";
import { NoWorkspaceBanner } from "@/components/workspaces/no-workspace-banner";
import { COOKIES, PROJECT_SORTS } from "@/const";
import { getProjects, getWorkspaceContext } from "@/lib/data";
import { parseCookieValue } from "@/utils/helpers";
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

  const [projects, { canEdit }] = await Promise.all([
    getProjects(activeWorkspaceId),
    getWorkspaceContext(activeWorkspaceId),
  ]);

  return (
    <ProjectsView
      projects={projects}
      canManage={canEdit}
      workspaceId={activeWorkspaceId}
      defaultSort={defaultSort}
    />
  );
}
