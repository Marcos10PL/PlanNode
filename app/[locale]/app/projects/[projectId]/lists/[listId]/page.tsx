import { TaskListSection } from "@/components/tasks/task-list-section";
import { TaskProgress } from "@/components/ui/task-progress";
import { COOKIES, TASK_STATUSES } from "@/const";
import { getProject, getTaskList, getWorkspaceContext } from "@/lib/data";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ projectId: string; listId: string }>;
};

export default async function TaskListPage({ params }: Props) {
  const { projectId, listId } = await params;

  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get(COOKIES.ACTIVE_WORKSPACE_ID)?.value;

  const [project, list] = await Promise.all([
    getProject(projectId),
    getTaskList(listId),
  ]);

  if (
    !project ||
    !list ||
    list.projectId !== project.id ||
    project.workspaceId !== activeWorkspaceId
  ) {
    notFound();
  }

  const { members, canEdit } = await getWorkspaceContext(project.workspaceId);

  const doneTasks = list.tasks.filter(
    task => task.status === TASK_STATUSES.DONE,
  ).length;
  const cancelledTasks = list.tasks.filter(
    task => task.status === TASK_STATUSES.CANCELLED,
  ).length;

  return (
    <div className="mt-4">
      <TaskListSection list={list} members={members} canEdit={canEdit}>
        <section className="max-w-md mt-2 mb-4">
          <TaskProgress
            total={list.tasks.length}
            done={doneTasks}
            cancelled={cancelledTasks}
            showLabel
          />
        </section>
      </TaskListSection>
    </div>
  );
}
