import { MyTasksSection } from "@/components/dashboard/my-tasks-section";
import { SubHeader } from "@/components/sub-header";
import { NoWorkspaceBanner } from "@/components/workspaces/no-workspace-banner";
import { KANBAN_COLUMN_WIDTH, KANBAN_GAP, TASK_STATUS_ORDER } from "@/const";
import {
  getActiveWorkspaceId,
  getMyTasks,
  getWorkspaceContext,
} from "@/lib/data";
import { getTranslations } from "next-intl/server";

const boardWidth =
  TASK_STATUS_ORDER.length * KANBAN_COLUMN_WIDTH +
  (TASK_STATUS_ORDER.length - 1) * KANBAN_GAP;

export default async function DashboardPage() {
  const t = await getTranslations();

  const activeWorkspaceId = await getActiveWorkspaceId();

  if (!activeWorkspaceId) {
    return (
      <div className="mt-6 px-4 md:px-6">
        <NoWorkspaceBanner />
      </div>
    );
  }

  const [myTasks, { members, canEdit, canManage }] = await Promise.all([
    getMyTasks(activeWorkspaceId),
    getWorkspaceContext(activeWorkspaceId),
  ]);

  return (
    <div className="flex flex-col mt-1 px-4 md:px-6">
      <div
        className="flex flex-col mx-auto"
        style={{ width: `min(100%, ${boardWidth}px)` }}
      >
        <SubHeader
          title={t("dashboard.title")}
          description={t("dashboard.description")}
        />

        <MyTasksSection
          tasks={myTasks}
          members={members}
          canEdit={canEdit}
          canManage={canManage}
        />
      </div>
    </div>
  );
}
