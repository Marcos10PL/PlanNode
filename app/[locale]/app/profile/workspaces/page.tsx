"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { CreateWorkspaceModal } from "@/components/workspaces/create-workspace-modal";
import { useWorkspaces } from "@/components/providers/workspace-provider";

export default function ProfileWorkspacesPage() {
  const t = useTranslations("profile_workspaces");
  const { workspaces } = useWorkspaces();

  return (
    <Card className="flex-1 border-0 max-w-5xl">
      <CardHeader className="flex flex-col! md:flex-row! md:items-center gap-x-8 gap-y-4 justify-between">
        <div>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </div>
        <CreateWorkspaceModal />
      </CardHeader>
      <CardContent>
        {workspaces.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("no_workspaces")}</p>
        ) : (
          <ul className="grid gap-2">
            {workspaces.map(workspace => (
              <li
                key={workspace.id}
                className="flex items-center justify-between rounded-md border px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">{workspace.name}</p>
                  {workspace.description && (
                    <p className="text-muted-foreground">
                      {workspace.description}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
