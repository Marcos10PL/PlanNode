import { ProjectActions } from "@/components/projects/project-actions";
import { ProjectDescription } from "@/components/projects/project-description";
import { ProjectMembersSection } from "@/components/projects/project-members-section";
import { AddTaskListButton } from "@/components/tasks/add-task-list-button";
import { TaskListCard } from "@/components/tasks/task-list-card";
import { Badge } from "@/components/ui/badge";
import { TaskProgress } from "@/components/ui/task-progress";
import { COOKIES } from "@/const";
import {
  getProject,
  getProjectMemberIds,
  getProjects,
  getWorkspaceContext,
} from "@/lib/data";
import {
  cn,
  formatDate,
  getProjectColorBorderClass,
  getProjectColorTextClass,
  getProjectIcon,
} from "@/utils";
import { List, Lock, Play } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectPage({ params }: Props) {
  const { projectId } = await params;
  const t = await getTranslations("projects");
  const locale = await getLocale();

  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get(COOKIES.ACTIVE_WORKSPACE_ID)?.value;

  const project = await getProject(projectId);

  if (!project || project.workspaceId !== activeWorkspaceId) {
    notFound();
  }

  const [projects, { members, canEdit, canManage }, memberIds] =
    await Promise.all([
      getProjects(project.workspaceId),
      getWorkspaceContext(project.workspaceId),
      getProjectMemberIds(project.id),
    ]);

  const projectWithProgress = projects.find(p => p.id === project.id);
  const lists = projectWithProgress?.lists ?? [];

  const ProjectIcon = getProjectIcon(project.icon);

  const iconClassName = cn(
    "h-5 w-5 shrink-0",
    getProjectColorTextClass(project.color),
  );

  return (
    <>
      <div className="flex flex-col gap-2 mt-4 mb-6">
        <div className="flex flex-col md:flex-row-reverse md:items-center gap-x-2 min-w-0 md:max-w-fit">
          <div className="flex items-center gap-2 min-w-0 self-end w-full md:w-fit">
            <ProjectIcon className={`${iconClassName} md:hidden mr-auto`} />
            {project.isPrivate && (
              <Badge variant="outline" className="shrink-0 pointer-events-none">
                <Lock className="h-3 w-3 mr-1" />
                {t("private_badge")}
              </Badge>
            )}
            <ProjectActions project={project} canManage={canManage} />
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <ProjectIcon className={`${iconClassName} hidden md:block`} />
            <h1 className="min-w-0">{project.name}</h1>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "md:border-l md:ml-8 pt-6 -mt-6 space-y-6 relative",
          getProjectColorBorderClass(project.color),
        )}
      >
        {project.description && (
          <>
            <ArrowRight color={project.color} className="mt-1" />
            <ProjectDescription description={project.description} />
          </>
        )}

        <div className="flex flex-col gap-8">
          <section>
            <ArrowRight color={project.color} className="mt-1" />
            <TaskProgress
              total={projectWithProgress?.totalTasks ?? 0}
              done={projectWithProgress?.doneTasks ?? 0}
              cancelled={projectWithProgress?.cancelledTasks ?? 0}
            />
          </section>

          <section className="flex flex-col gap-2">
            <div className="flex items-center gap-x-3">
              <ArrowRight color={project.color} />
              <List className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">
                {t("lists_section")} ({lists.length})
              </h2>
              {canEdit && <AddTaskListButton projectId={project.id} />}
            </div>
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {lists.map(list => (
                <TaskListCard
                  key={list.id}
                  list={list}
                  projectId={project.id}
                  canEdit={canEdit}
                />
              ))}
            </div>
          </section>

          {project.isPrivate && (
            <div>
              <ArrowRight color={project.color} className="mt-3" />
              <ProjectMembersSection
                projectId={project.id}
                members={members}
                memberIds={memberIds}
                canManage={canManage}
              />
            </div>
          )}

          <div className="text-xs text-muted-foreground italic">
            <ArrowRight color={project.color} className="mt-0.5" />
            <p className="h-3">
              {t("created_at", { date: formatDate(project.createdAt, locale) })}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function ArrowRight({
  className,
  color,
}: {
  className?: string;
  color: string;
}) {
  return (
    <Play
      className={cn(
        "hidden md:block absolute size-2.5 opacity-40 fill-current left-[-0.15rem]",
        getProjectColorTextClass(color),
        className,
      )}
    />
  );
}
