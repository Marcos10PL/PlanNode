import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MyAccount } from "@/components/nav/my-account";
import { UserProvider } from "@/components/providers/user-provider";
import { WorkspaceProvider } from "@/components/providers/workspace-provider";
import { getProfile, getWorkspaces } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { cookies } from "next/headers";
import { COOKIES } from "@/const";

export async function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get(COOKIES.activeWorkspaceId)?.value ?? null;

  const [{ profile, user }, workspaces] = await Promise.all([
    getProfile(),
    getWorkspaces(),
  ]);

  return (
    <UserProvider profile={profile} user={user}>
      <WorkspaceProvider workspaces={workspaces} activeWorkspaceId={activeWorkspaceId}>
        <SidebarProvider>
          <AppSidebar />

          <div className="w-full flex flex-col h-screen">
            <div className="flex justify-between items-center border-b p-2">
              <SidebarTrigger />
              <MyAccount />
            </div>
            <Card className="flex flex-1 m-2">{children}</Card>
          </div>
        </SidebarProvider>
      </WorkspaceProvider>
    </UserProvider>
  );
}
