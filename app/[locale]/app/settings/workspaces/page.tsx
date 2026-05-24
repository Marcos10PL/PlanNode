"use client";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { useWorkspaces } from "@/components/providers/workspace-provider";
import { SettingsHeader } from "@/components/settings/settings-header";
import { CreateWorkspaceModal } from "@/components/workspaces/create-workspace-modal";
import { WorkspaceItem } from "@/components/workspaces/elements/workspace-item";
import { NoWorkspaceBanner } from "@/components/workspaces/no-workspace-banner";
import { useTranslations } from "next-intl";

export default function ProfileWorkspacesPage() {
  const t = useTranslations("profile_workspaces");
  const { workspaces } = useWorkspaces();
  const { max_workspaces_per_user } = useAppConfig();

  return (
    <>
      <div className="flex flex-col! md:flex-row! md:items-center gap-x-8 gap-y-4 justify-between mt-4 mb-6">
        <SettingsHeader
          title={t("title")}
          description={`${t("description")} (${workspaces.length}/${max_workspaces_per_user})`}
        />
        <CreateWorkspaceModal />
      </div>

      {workspaces.length === 0 ? (
        <div className="mt-12">
          <NoWorkspaceBanner />
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-full max-w-full overflow-hidden">
          {workspaces.map(workspace => (
            <WorkspaceItem key={workspace.id} workspace={workspace} />
          ))}
        </div>
      )}
    </>
  );
}
