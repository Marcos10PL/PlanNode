"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { updateLocaleAction } from "@/actions/profile/update-locale";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Profile } from "@/types/dto";
import { PL, US } from "country-flag-icons/react/3x2";
import { useLocale } from "next-intl";
import { Button } from "./ui/button";

type Props = {
  iconOnly?: boolean;
};

export default function LanguageSwitcher({ iconOnly = false }: Props) {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (newLocale: string) => {
    updateLocaleAction(newLocale as Profile["locale"]);
    router.push(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size={iconOnly ? "icon" : "sm"}>
          {!iconOnly ? currentLocale.toUpperCase() : null}
          {getFlagIcon(currentLocale)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-26">
        <DropdownMenuRadioGroup
          value={currentLocale}
          onValueChange={handleLanguageChange}
        >
          {routing.locales.map(loc => (
            <DropdownMenuRadioItem
              key={loc}
              value={loc}
              className="cursor-pointer flex items-center justify-between"
            >
              {loc.toUpperCase()}
              {getFlagIcon(loc)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getFlagIcon(locale: string) {
  switch (locale.toLowerCase()) {
    case "en":
      return <US className="h-4 w-4" />;
    case "pl":
      return <PL className="h-4 w-4" />;
    default:
      return null;
  }
}
