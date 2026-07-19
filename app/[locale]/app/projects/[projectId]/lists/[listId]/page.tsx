import { TaskListSection } from "@/components/tasks/task-list-section";
import { COOKIES } from "@/const";
import {
  getProject,
  getProjectMemberIds,
  getTaskList,
  getWorkspaceContext,
} from "@/lib/data";
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

  let assignableMembers = members;
  if (project.isPrivate) {
    const projectMemberIds = await getProjectMemberIds(project.id);
    assignableMembers = members.filter(m => projectMemberIds.includes(m.id));
  }

  return (
    <TaskListSection
      list={list}
      members={assignableMembers}
      canEdit={canEdit}
    />
  );
}
