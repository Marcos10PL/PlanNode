"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils";
import { LucideIcon, MoreHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";

export type ManageMenuItem = {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  destructive?: boolean;
};

type Props = {
  items: ManageMenuItem[];
  disabled?: boolean;
  align?: "start" | "end";
  side?: "top" | "right" | "bottom" | "left";
  trigger?: React.ReactNode;
  triggerClassName?: string;
};

export function ManageMenu({
  items,
  disabled,
  align = "end",
  side,
  trigger,
  triggerClassName,
}: Props) {
  const t = useTranslations("common");

  if (items.length === 0) return null;

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            {trigger ?? (
              <Button
                variant="ghost"
                size="icon"
                className={triggerClassName}
                disabled={disabled}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            )}
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t("manage")}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align={align} side={side}>
        {items.map(item => (
          <DropdownMenuItem
            key={item.label}
            className={cn(
              item.destructive && "text-destructive focus:text-destructive",
            )}
            onClick={item.onClick}
          >
            <item.icon className="mr-1 h-4 w-4" />
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
