"use client";

import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { TaskStatus } from "@/types/entities";
import {
  cn,
  getNextStatus,
  getStatusBgStrongClass,
  getStatusBgStrongHoverClass,
  getStatusLabel,
} from "@/utils";
import { StepForward } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  status: TaskStatus;
  hiddenStatuses?: Set<TaskStatus>;
  onAdvance: (nextStatus: TaskStatus) => void;
  disabled?: boolean;
  className?: string;
};

export function AdvanceStatusButton({
  status,
  hiddenStatuses,
  onAdvance,
  disabled,
  className,
}: Props) {
  const t = useTranslations("tasks");
  const tRoot = useTranslations();
  const nextStatus = getNextStatus(status, hiddenStatuses);

  return (
    <TooltipIconButton
      icon={StepForward}
      label={t("advance_status_to", {
        status: getStatusLabel(nextStatus, tRoot),
      })}
      onClick={() => onAdvance(nextStatus)}
      disabled={disabled}
      variant="secondary"
      className={cn(
        getStatusBgStrongClass(status),
        getStatusBgStrongHoverClass(status),
        className,
      )}
    />
  );
}
