import { ProjectActions } from "@/components/projects/project-actions";
import { SubHeader } from "@/components/sub-header";
import { TaskListSections } from "@/components/tasks/task-list-sections";
import { TasksRealtimeRefresher } from "@/components/tasks/tasks-realtime-refresher";
import { Badge } from "@/components/ui/badge";
import { COOKIES, MANAGER_ROLES, WORKSPACE_ROLES } from "@/const";
import {
  getProject,
  getProjectMemberIds,
  getTaskLists,
  getWorkspaceMembers,
} from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { Lock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;
  const t = await getTranslations("projects");

  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get(COOKIES.ACTIVE_WORKSPACE_ID)?.value;

  const project = await getProject(projectId);

  if (!project || project.workspaceId !== activeWorkspaceId) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [lists, members, memberIds] = await Promise.all([
    getTaskLists(project.id),
    getWorkspaceMembers(project.workspaceId),
    getProjectMemberIds(project.id),
  ]);

  const currentMember = members.find(m => m.id === user?.id);
  const currentRole = currentMember?.role ?? WORKSPACE_ROLES.GUEST;
  const canEdit = currentRole !== WORKSPACE_ROLES.GUEST;
  const canManageMembers = MANAGER_ROLES.includes(currentRole);

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <SubHeader title={project.name} description={project.description ?? undefined} />
          {project.isPrivate && (
            <Badge variant="outline" className="shrink-0 pointer-events-none mt-4">
              <Lock className="h-3 w-3 mr-1" />
              {t("private_badge")}
            </Badge>
          )}
        </div>
        {canEdit && (
          <div className="mt-4">
            <ProjectActions
              project={project}
              members={members}
              memberIds={memberIds}
              canManage={canManageMembers}
            />
          </div>
        )}
      </div>

      <TaskListSections lists={lists} members={members} canEdit={canEdit} />

      <TasksRealtimeRefresher projectId={project.id} />
    </>
  );
}
