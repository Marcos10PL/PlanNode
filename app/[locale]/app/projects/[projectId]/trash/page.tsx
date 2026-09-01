import { ProjectTrashPanel } from "@/components/projects/project-trash-panel";
import { COOKIES, TRASH_SORTS } from "@/const";
import {
  getProject,
  getTrashedTaskLists,
  getTrashedTasksInProject,
  getWorkspaceContext,
} from "@/lib/data";
import { getProjectColorTextClass, getProjectIcon } from "@/utils";
import { parseCookieValue } from "@/utils/helpers";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectTrashPage({ params }: Props) {
  const { projectId } = await params;
  const t = await getTranslations("tasks.trash");

  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get(COOKIES.ACTIVE_WORKSPACE_ID)?.value;

  const project = await getProject(projectId);

  if (
    !project ||
    (activeWorkspaceId && project.workspaceId !== activeWorkspaceId)
  ) {
    notFound();
  }

  const defaultListsSort = parseCookieValue(
    cookieStore.get(COOKIES.LISTS_TRASH_SORT)?.value,
    TRASH_SORTS.DELETED_NEWEST,
  );
  const defaultTasksSort = parseCookieValue(
    cookieStore.get(COOKIES.TASKS_TRASH_SORT)?.value,
    TRASH_SORTS.DELETED_NEWEST,
  );

  const [
    { lists, hasMore: listsHasMore },
    { tasks, hasMore: tasksHasMore },
    { canEdit, canManage, user },
  ] = await Promise.all([
    getTrashedTaskLists(project.id, defaultListsSort),
    getTrashedTasksInProject(project.id, defaultTasksSort),
    getWorkspaceContext(project.workspaceId),
  ]);

  const ProjectIcon = getProjectIcon(project.icon);

  return (
    <ProjectTrashPanel
      projectId={project.id}
      title={
        <>
          <span className="shrink-0">{t("title_prefix")}</span>
          <span className="text-muted-foreground shrink-0">—</span>
          <ProjectIcon
            className={`h-5 w-5 shrink-0 ${getProjectColorTextClass(project.color)}`}
          />
          <span className="truncate min-w-0">{project.name}</span>
        </>
      }
      initialLists={lists}
      initialListsHasMore={listsHasMore}
      initialListsSort={defaultListsSort}
      initialTasks={tasks}
      initialTasksHasMore={tasksHasMore}
      initialTasksSort={defaultTasksSort}
      canEdit={canEdit}
      isWorkspaceManager={canManage}
      currentUserId={user.id}
    />
  );
}
