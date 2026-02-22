"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "./ui/button";
import { PL, US } from "country-flag-icons/react/3x2";

export default function LanguageSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size={"sm"}>
          {currentLocale.toUpperCase()}
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
