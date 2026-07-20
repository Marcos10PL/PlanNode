import { AppSidebar } from "@/components/app-sidebar";
import { MyAccount } from "@/components/nav/my-account";
import { NotificationsIndicator } from "@/components/notifications/notifications-indicator";
import { AppConfigProvider } from "@/components/providers/app-config-provider";
import { UserProvider } from "@/components/providers/user-provider";
import { WorkspaceProvider } from "@/components/providers/workspace-provider";
import { RealtimeRefresher } from "@/components/realtime-refresher";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { COOKIES, LINKS } from "@/const";
import { routing } from "@/i18n/routing";
import {
  getAppConfig,
  getProfile,
  getProjects,
  getWorkspaceContext,
  getWorkspaces,
} from "@/lib/data";
import { parseCookieValue } from "@/utils/helpers";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function DashboardShell({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const cookieStore = await cookies();
  const activeWorkspaceId =
    cookieStore.get(COOKIES.ACTIVE_WORKSPACE_ID)?.value ?? null;
  const sidebarOpen = cookieStore.get(COOKIES.SIDEBAR_STATE)?.value !== "false";
  const defaultExpandedProjectIds = parseCookieValue<string[]>(
    cookieStore.get(COOKIES.SIDEBAR_EXPANDED_PROJECTS)?.value,
    [],
  );

  const [{ profile, user }, workspaces, appConfig] = await Promise.all([
    getProfile(),
    getWorkspaces(),
    getAppConfig(),
  ]);

  const [projects, workspaceContext] = activeWorkspaceId
    ? await Promise.all([
        getProjects(activeWorkspaceId),
        getWorkspaceContext(activeWorkspaceId),
      ])
    : [[], null];

  const canManageProjects = workspaceContext?.canEdit ?? false;

  if (
    profile &&
    profile.locale !== locale &&
    routing.locales.includes(profile.locale)
  ) {
    redirect(`/${profile.locale}${LINKS.DASHBOARD}`);
  }

  return (
    <AppConfigProvider config={appConfig}>
      <UserProvider profile={profile} user={user}>
        <WorkspaceProvider
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
        >
          <SidebarProvider defaultOpen={sidebarOpen}>
            <AppSidebar
              projects={projects}
              workspaceId={activeWorkspaceId}
              canManageProjects={canManageProjects}
              defaultExpandedProjectIds={defaultExpandedProjectIds}
            />

            <div className="flex-1 min-w-0 flex flex-col h-screen">
              <div className="flex justify-between items-center border-b p-2">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <NotificationsIndicator />
                  <MyAccount />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto overflow-x-hidden pb-6">
                {children}
              </div>
            </div>

            <RealtimeRefresher />
          </SidebarProvider>
        </WorkspaceProvider>
      </UserProvider>
    </AppConfigProvider>
  );
}
