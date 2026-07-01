"use client";

import { useWorkspaces } from "@/components/providers/workspace-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CreateWorkspaceModal } from "@/components/workspaces/create-workspace-modal";
import { LINKS } from "@/const";
import { cn } from "@/utils";
import { ChartNoAxesGantt, ChevronDown, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function WorkspaceSwitcher() {
  const t = useTranslations("workspace");
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaces();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton>
              <ChartNoAxesGantt className="mr-2" />
              <span className="truncate">
                {activeWorkspace?.name || t("workspaces.title")}
              </span>
              <ChevronDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-full">
            {workspaces.length > 0 ? (
              <div
                className={cn(
                  "min-w-50 max-h-40 overflow-y-auto w-(--radix-dropdown-menu-trigger-width)",
                  workspaces.length > 5 ? "pr-1" : "pr-0",
                )}
              >
                {workspaces.map(workspace => (
                  <DropdownMenuItem
                    onClick={() => setActiveWorkspace(workspace)}
                    key={workspace.id}
                    className={cn(
                      "overflow-hidden",
                      workspace.id === activeWorkspace?.id &&
                        "bg-accent pointer-events-none",
                    )}
                  >
                    <span className="truncate min-w-0 flex-1">
                      {workspace.name}
                    </span>
                  </DropdownMenuItem>
                ))}
              </div>
            ) : (
              <div className="min-w-(--radix-dropdown-menu-trigger-width) *:w-full">
                <CreateWorkspaceModal />
              </div>
            )}

            <DropdownMenuGroup className="pt-1">
              <DropdownMenuItem
                asChild
                className="bg-secondary hover:bg-secondary/80!"
              >
                <Link
                  href={LINKS.PROFILE_WORKSPACES}
                  className="flex items-center gap-2"
                >
                  <Settings size={16} />
                  {t("workspaces.settings")}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
