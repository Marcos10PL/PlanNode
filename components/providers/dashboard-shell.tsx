import { AppSidebar } from "@/components/app-sidebar";
import { MyAccount } from "@/components/nav/my-account";
import { NotificationsIndicator } from "@/components/notifications/notifications-indicator";
import { AppConfigProvider } from "@/components/providers/app-config-provider";
import { UserProvider } from "@/components/providers/user-provider";
import { WorkspaceProvider } from "@/components/providers/workspace-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { COOKIES } from "@/const";
import { routing } from "@/i18n/routing";
import { getAppConfig, getProfile, getWorkspaces } from "@/lib/data";
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
    cookieStore.get(COOKIES.activeWorkspaceId)?.value ?? null;

  const [{ profile, user }, workspaces, appConfig] = await Promise.all([
    getProfile(),
    getWorkspaces(),
    getAppConfig(),
  ]);

  if (
    profile &&
    profile.locale !== locale &&
    routing.locales.includes(profile.locale)
  ) {
    redirect(`/${profile.locale}/app/dashboard`);
  }

  return (
    <AppConfigProvider config={appConfig}>
      <UserProvider profile={profile} user={user}>
        <WorkspaceProvider
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
        >
          <SidebarProvider>
            <AppSidebar />

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
          </SidebarProvider>
        </WorkspaceProvider>
      </UserProvider>
    </AppConfigProvider>
  );
}
