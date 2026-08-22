"use client";

import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { cn } from "@/utils";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

export function DeleteButton({ onClick, disabled, className }: Props) {
  const t = useTranslations("common");

  return (
    <TooltipIconButton
      icon={Trash2}
      label={t("delete")}
      onClick={onClick}
      disabled={disabled}
      className={cn("text-destructive", className)}
    />
  );
}
