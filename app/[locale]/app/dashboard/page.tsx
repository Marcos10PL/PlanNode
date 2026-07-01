"use client";

import { useWorkspaces } from "@/components/providers/workspace-provider";
import { NoWorkspaceBanner } from "@/components/workspaces/no-workspace-banner";

export default function DashboardPage() {
  const { workspaces } = useWorkspaces();

  return (
    <div className="w-full flex flex-col justify-center items-center gap-6 p-6">
      {workspaces.length > 0 ? (
        <h1 className="text-2xl font-bold">Welcome to PlanNode!</h1>
      ) : (
        <NoWorkspaceBanner />
      )}
    </div>
  );
}
