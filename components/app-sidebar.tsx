"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  ChartNoAxesGantt,
  ChevronDown,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import LanguageSwitcher from "./language-switcher";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "@/i18n/navigation";
import { LINKS } from "@/const";
import { useTranslations } from "next-intl";
import { DropdownMenuGroup } from "@radix-ui/react-dropdown-menu";
import { useWorkspaces } from "./providers/workspace-provider";
import { CreateWorkspaceModal } from "./workspaces/create-workspace-modal";

export function AppSidebar() {
  const pathname = usePathname();
  const t = useTranslations("workspace");

  const isActive = (href: string) => {
    const cleanPathname = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");

    return (
      cleanPathname === href &&
      "bg-accent text-accent-foreground pointer-events-none!"
    );
  };

  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaces();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
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
                {workspaces.length > 1 ? (
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
                      href={LINKS.profileWorkspaces}
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
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href={LINKS.dashboard}
                className={cn(isActive(LINKS.dashboard))}
              >
                <LayoutDashboard className="mr-2" />
                Dashboard
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroup>

        {/* <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Plus className="mr-2" />
                  New Project
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>

        <div className="hidden items-center justify-center gap-2 group-data-[collapsible=icon]:flex flex-col">
          <LanguageSwitcher iconOnly />
          <ThemeSwitcher />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
