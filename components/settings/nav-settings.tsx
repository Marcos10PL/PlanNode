"use client";

import { LINKS } from "@/const";
import { usePathname } from "@/i18n/navigation";
import { cn, isActivePath } from "@/lib/utils";
import { Translations } from "@/types";
import { useTranslations } from "next-intl";
import Link from "next/link";

const navItems = (t: Translations) => [
  {
    label: t("settings.profile"),
    href: LINKS.profileSettings,
  },
  {
    label: t("settings.workspace"),
    href: LINKS.profileWorkspaces,
  },
];

export function NavSettings() {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <nav className="flex overflow-x-auto border-b mt-5 mb-2 px-4 md:px-6">
      {navItems(t).map(item => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "shrink-0 whitespace-nowrap px-3 py-2 text-sm border border-b-0 rounded-t-md mr-1.5 last:mr-0",
            isActivePath(pathname, item.href)
              ? "bg-muted border-primary/30 pointer-events-none"
              : "border-transparent hover:bg-muted transition-colors",
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
