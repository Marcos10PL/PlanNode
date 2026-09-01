import { ProjectTrashList } from "@/components/projects/project-trash-list";
import { NoWorkspaceBanner } from "@/components/workspaces/no-workspace-banner";
import { COOKIES, TRASH_SORTS } from "@/const";
import {
  getActiveWorkspaceId,
  getTrashedProjects,
  getWorkspaceContext,
} from "@/lib/data";
import { parseCookieValue } from "@/utils/helpers";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

export default async function TrashedProjectsPage() {
  const activeWorkspaceId = await getActiveWorkspaceId();

  if (!activeWorkspaceId) {
    return (
      <div className="mt-6">
        <NoWorkspaceBanner />
      </div>
    );
  }

  const cookieStore = await cookies();
  const defaultSort = parseCookieValue(
    cookieStore.get(COOKIES.PROJECTS_TRASH_SORT)?.value,
    TRASH_SORTS.DELETED_NEWEST,
  );

  const [{ projects, hasMore }, { canEdit, canManage }, t] = await Promise.all([
    getTrashedProjects(activeWorkspaceId, defaultSort),
    getWorkspaceContext(activeWorkspaceId),
    getTranslations("projects"),
  ]);

  return (
    <ProjectTrashList
      workspaceId={activeWorkspaceId}
      title={t("title_trash")}
      initialProjects={projects}
      initialHasMore={hasMore}
      initialSort={defaultSort}
      canEdit={canEdit}
      isWorkspaceManager={canManage}
    />
  );
}
