import { ProjectList } from "@/components/projects/project-list";
import { ProjectModal } from "@/components/projects/project-modal";
import { SubHeader } from "@/components/sub-header";
import { NoWorkspaceBanner } from "@/components/workspaces/no-workspace-banner";
import { COOKIES } from "@/const";
import { getProjects, getWorkspaceContext } from "@/lib/data";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

export default async function ProjectsPage() {
  const t = await getTranslations("projects");

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
      <div className="flex items-start justify-between gap-4">
        <SubHeader title={t("title")} description={t("workspace_context")} />
        {canEdit && <ProjectModal workspaceId={activeWorkspaceId} />}
      </div>

      <ProjectList projects={projects} canManage={canEdit} />
    </>
  );
}
