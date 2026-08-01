"use client";

import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { cn } from "@/utils";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
};

export function EditButton({ onClick, disabled, className }: Props) {
  const t = useTranslations("common");

  return (
    <TooltipIconButton
      icon={Pencil}
      label={t("edit")}
      onClick={onClick}
      disabled={disabled}
      className={cn("text-info", className)}
    />
  );
}
