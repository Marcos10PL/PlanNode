import { CreateProjectModal } from "@/components/projects/create-project-modal";
import { ProjectList } from "@/components/projects/project-list";
import { SubHeader } from "@/components/sub-header";
import { NoWorkspaceBanner } from "@/components/workspaces/no-workspace-banner";
import { COOKIES, WORKSPACE_ROLES } from "@/const";
import { getProjects, getWorkspaceMembers } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [projects, members] = await Promise.all([
    getProjects(activeWorkspaceId),
    getWorkspaceMembers(activeWorkspaceId),
  ]);

  const currentMember = members.find(m => m.id === user?.id);
  const canManage =
    !!currentMember && currentMember.role !== WORKSPACE_ROLES.GUEST;

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <SubHeader title={t("title")} description={t("workspace_context")} />
        {canManage && <CreateProjectModal workspaceId={activeWorkspaceId} />}
      </div>

      <ProjectList projects={projects} canManage={canManage} />
    </>
  );
}
