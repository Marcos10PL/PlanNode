"use client";

import { PillTab } from "@/components/ui/pill-tab";
import { PillTabs } from "@/components/ui/pill-tabs";
import { LINKS } from "@/const";
import { usePathname } from "@/i18n/navigation";
import { Translations } from "@/types";
import { isActivePath } from "@/utils";
import { useTranslations } from "next-intl";

const navItems = (t: Translations) => [
  {
    label: t("settings.profile"),
    href: LINKS.PROFILE_SETTINGS,
  },
  {
    label: t("settings.workspace"),
    href: LINKS.PROFILE_WORKSPACES,
  },
  {
    label: t("settings.team"),
    href: LINKS.TEAM,
  },
];

export function NavSettings() {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <PillTabs>
      {navItems(t).map(item => (
        <PillTab
          key={item.href}
          href={item.href}
          label={item.label}
          active={isActivePath(pathname, item.href)}
          className="mr-1.5 last:mr-0"
        />
      ))}
    </PillTabs>
  );
}
