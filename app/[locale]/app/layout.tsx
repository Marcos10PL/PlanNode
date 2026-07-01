import { AppLoader } from "@/components/app-loader";
import { DashboardShell } from "@/components/providers/dashboard-shell";
import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

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
    <Suspense fallback={<AppLoader />}>
      <DashboardShell locale={locale}>{children}</DashboardShell>
    </Suspense>
  );
}
