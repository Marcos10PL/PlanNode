"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LINKS } from "@/const";
import { usePathname } from "@/i18n/navigation";
import { ProjectWithProgress } from "@/types/dto";
import { cn, isActivePath } from "@/utils";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import LanguageSwitcher from "./language-switcher";
import { SidebarProjects } from "./nav/sidebar-projects";
import { ThemeSwitcher } from "./theme-switcher";
import { WorkspaceSwitcher } from "./workspaces/workspace-switcher";

type Props = {
  projects: ProjectWithProgress[];
  workspaceId: string | null;
  canManageProjects: boolean;
};

export function AppSidebar({ projects, workspaceId, canManageProjects }: Props) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const isActive = (href: string) =>
    isActivePath(pathname, href) &&
    "bg-accent text-accent-foreground pointer-events-none!";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Dashboard">
              <Link
                href={LINKS.DASHBOARD}
                className={cn(isActive(LINKS.DASHBOARD))}
                onClick={() => setOpenMobile(false)}
              >
                <LayoutDashboard className="mr-2" />
                Dashboard
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroup>

        <SidebarProjects
          projects={projects}
          workspaceId={workspaceId}
          canManage={canManageProjects}
        />
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
