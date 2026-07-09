import { ProjectList } from "@/components/projects/project-list";
import { SubHeader } from "@/components/sub-header";
import { TasksRealtimeRefresher } from "@/components/tasks/tasks-realtime-refresher";
import { Badge } from "@/components/ui/badge";
import { NoWorkspaceBanner } from "@/components/workspaces/no-workspace-banner";
import { COOKIES } from "@/const";
import { getMyTasks, getProjects } from "@/lib/data";
import { cn, formatDate, getPriorityLabel, getPriorityVariant, getStatusLabel, getStatusVariant } from "@/utils";
import { generateProjectRoute } from "@/utils/helpers";
import { getLocale, getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function DashboardPage() {
  const t = await getTranslations();
  const locale = await getLocale();

  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get(COOKIES.ACTIVE_WORKSPACE_ID)?.value;

  if (!activeWorkspaceId) {
    return (
      <div className="mt-6 px-4 md:px-6">
        <NoWorkspaceBanner />
      </div>
    );
  }

  const [myTasks, projects] = await Promise.all([
    getMyTasks(activeWorkspaceId),
    getProjects(activeWorkspaceId),
  ]);

  const now = new Date();

  return (
    <div className="flex-1 border-0 shadow-none max-w-5xl overflow-hidden *:px-4 md:*:px-6">
      <SubHeader
        title={t("dashboard.title")}
        description={t("dashboard.description")}
      />

      <div className="flex flex-col gap-8">
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">{t("dashboard.my_tasks")}</h2>
          {myTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("dashboard.no_tasks")}
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-accent/70">
              {myTasks.map(task => {
                const isOverdue =
                  task.dueDate && new Date(task.dueDate) < now;

                return (
                  <div key={task.id} className="flex items-center gap-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">
                        {task.title}
                      </p>
                      <Link
                        href={generateProjectRoute(task.projectId)}
                        className="text-sm text-muted-foreground hover:underline line-clamp-1"
                      >
                        {task.projectName}
                      </Link>
                    </div>

                    {task.dueDate && (
                      <span
                        className={cn(
                          "text-xs shrink-0",
                          isOverdue
                            ? "text-destructive font-medium"
                            : "text-muted-foreground",
                        )}
                      >
                        {formatDate(task.dueDate, locale)}
                      </span>
                    )}

                    <Badge
                      variant={getPriorityVariant(task.priority)}
                      className="shrink-0 pointer-events-none hidden sm:inline-flex"
                    >
                      {getPriorityLabel(task.priority, t)}
                    </Badge>

                    <Badge
                      variant={getStatusVariant(task.status)}
                      className="shrink-0 pointer-events-none"
                    >
                      {getStatusLabel(task.status, t)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">
            {t("dashboard.projects_progress")}
          </h2>
          <ProjectList projects={projects} canManage={false} />
        </section>
      </div>

      <TasksRealtimeRefresher />
    </div>
  );
}
