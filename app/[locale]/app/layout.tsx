import { AppSidebar } from "@/components/app-sidebar";
import Navigation from "@/components/app-navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/dist/client/components/navigation";
import { Suspense } from "react";
import NavButtons from "@/components/elements/nav-buttons";

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

  return (
    <SidebarProvider>
      <AppSidebar />

      <div className="w-full">
        <div className="flex justify-between items-center border-b p-2">
          <SidebarTrigger />
          <NavButtons />
        </div>
        <div className="p-2">{children}</div>
      </div>
    </SidebarProvider>
  );
}
