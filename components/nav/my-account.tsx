"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  CreditCardIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { LINKS } from "@/const";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logout } from "@/actions/auth";
import { useTransition } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function MyAccount() {
  const router = useRouter();
  const pathname = usePathname();

  const t = useTranslations("my_account");

  const [isPending, startTransition] = useTransition();

  const logOut = async () => {
    startTransition(async () => {
      await logout();
      router.refresh();
      router.replace("/auth/login");
    });
  };

  const isActive = (href: string) => {
    const cleanPathname = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");

    return (
      cleanPathname === href &&
      "bg-accent text-accent-foreground cursor-default!"
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="border-2 border-gray-400">
            <AvatarFallback>MK</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem asChild>
          <Link
            href={LINKS.profileSettings}
            className={cn(isActive(LINKS.profileSettings))}
          >
            <SettingsIcon />
            {t("settings")}
          </Link>
        </DropdownMenuItem>
        {/* <Link href={LINKS.dashboard} className={cn(isActive(LINKS.dashboard))}>
          <LayoutDashboard className="mr-2" />
          Dashboard
        </Link> */}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logOut} disabled={isPending}>
          <LogOutIcon />
          {t("sign_out")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
