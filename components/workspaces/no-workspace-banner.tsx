"use client";

import { useWorkspaces } from "@/components/providers/workspace-provider";
import { CreateWorkspaceModal } from "@/components/workspaces/create-workspace-modal";
import { useTranslations } from "next-intl";
import { ChartNoAxesGantt } from "lucide-react";

export function NoWorkspaceBanner() {
  const { workspaces } = useWorkspaces();
  const t = useTranslations("no_workspace_banner");

  if (workspaces.length > 0) return null;

  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center px-4">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <ChartNoAxesGantt className="size-6 text-muted-foreground" />
      </div>
      <div className="grid gap-1 max-w-md">
        <p className="font-semibold text-xl">{t("title")}</p>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      <CreateWorkspaceModal />
    </div>
  );
}
