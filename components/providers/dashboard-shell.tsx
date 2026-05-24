import { AppSidebar } from "@/components/app-sidebar";
import { MyAccount } from "@/components/nav/my-account";
import { AppConfigProvider } from "@/components/providers/app-config-provider";
import { UserProvider } from "@/components/providers/user-provider";
import { WorkspaceProvider } from "@/components/providers/workspace-provider";
import { Card } from "@/components/ui/card";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { COOKIES } from "@/const";
import { getAppConfig, getProfile, getWorkspaces } from "@/lib/data";
import { cookies } from "next/headers";

export async function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const activeWorkspaceId =
    cookieStore.get(COOKIES.activeWorkspaceId)?.value ?? null;

  const [{ profile, user }, workspaces, appConfig] = await Promise.all([
    getProfile(),
    getWorkspaces(),
    getAppConfig(),
  ]);

  return (
    <AppConfigProvider config={appConfig}>
      <UserProvider profile={profile} user={user}>
        <WorkspaceProvider
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
        >
          <SidebarProvider>
            <AppSidebar />

            <div className="w-full flex flex-col h-screen">
              <div className="flex justify-between items-center border-b p-2">
                <SidebarTrigger />
                <MyAccount />
              </div>
              <div className="flex-1 overflow-y-auto pb-6">
                {children}
              </div>
            </div>
          </SidebarProvider>
        </WorkspaceProvider>
      </UserProvider>
    </AppConfigProvider>
  );
}
