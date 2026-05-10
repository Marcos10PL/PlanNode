import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/dist/client/components/navigation";
import { MyAccount } from "@/components/nav/my-account";
import { UserProvider } from "@/components/providers/user-provider";
import { getProfile } from "@/lib/data";
import { Card } from "@/components/ui/card";

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const { profile, user } = await getProfile();

  return (
    <UserProvider profile={profile} user={user}>
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
    </UserProvider>
  );
}
