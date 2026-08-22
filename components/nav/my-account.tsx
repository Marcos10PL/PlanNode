"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { logout } from "@/actions/auth/logout";
import { LINKS } from "@/const";
import { cn, isActivePath } from "@/utils";
import { LogOutIcon, SettingsIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { useUser } from "../providers/user-provider";
import UserAvatar from "../user-avatar";

export function MyAccount() {
  const router = useRouter();
  const pathname = usePathname();

  const user = useUser();

  const t = useTranslations("my_account");

  const [isPending, startTransition] = useTransition();

  const logOut = async () => {
    startTransition(async () => {
      await logout();
      router.refresh();
      router.replace(LINKS.LOGIN);
    });
  };

  const isActive = (href: string) =>
    isActivePath(pathname, href) &&
    "bg-accent text-accent-foreground cursor-default!";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full group">
          <UserAvatar
            name={user?.profile.fullName}
            userId={user?.user.id}
            className="border-2 border-gray-400 group-hover:border-gray-300 transition-colors"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem asChild>
          <Link
            href={LINKS.PROFILE_SETTINGS}
            className={cn(isActive(LINKS.PROFILE_SETTINGS))}
          >
            <SettingsIcon />
            {t("settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logOut} disabled={isPending}>
          <LogOutIcon />
          {t("sign_out")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
