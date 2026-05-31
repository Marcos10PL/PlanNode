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
import { cn, isActivePath } from "@/utils";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import LanguageSwitcher from "./language-switcher";
import { ThemeSwitcher } from "./theme-switcher";
import { WorkspaceSwitcher } from "./workspaces/workspace-switcher";

export function AppSidebar() {
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
            <SidebarMenuButton asChild>
              <Link
                href={LINKS.dashboard}
                className={cn(isActive(LINKS.dashboard))}
                onClick={() => setOpenMobile(false)}
              >
                <LayoutDashboard className="mr-2" />
                Dashboard
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroup>
      </SidebarContent>
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
