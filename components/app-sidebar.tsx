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
import { useTranslations } from "next-intl";
import { cn, isActivePath, isActiveSubPath } from "@/utils";
import { FolderKanban, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import LanguageSwitcher from "./language-switcher";
import { ThemeSwitcher } from "./theme-switcher";
import { WorkspaceSwitcher } from "./workspaces/workspace-switcher";

export function AppSidebar() {
  const t = useTranslations("sidebar");
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
                href={LINKS.DASHBOARD}
                className={cn(isActive(LINKS.DASHBOARD))}
                onClick={() => setOpenMobile(false)}
              >
                <LayoutDashboard className="mr-2" />
                Dashboard
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link
                href={LINKS.PROJECTS}
                className={cn(
                  isActiveSubPath(pathname, LINKS.PROJECTS) &&
                    "bg-accent text-accent-foreground pointer-events-none!",
                )}
                onClick={() => setOpenMobile(false)}
              >
                <FolderKanban className="mr-2" />
                {t("projects")}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarGroup>
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
