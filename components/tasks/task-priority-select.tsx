"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_PRIORITIES } from "@/const";
import { TaskPriority } from "@/types/entities";
import { cn, getPriorityFlagClass, getPriorityLabel } from "@/utils";
import { Flag } from "lucide-react";
import { useTranslations } from "next-intl";

export function PriorityOptionLabel({ priority }: { priority: TaskPriority }) {
  const t = useTranslations();

  return (
    <span className="flex items-center gap-2">
      <Flag
        className={cn("h-4 w-4 fill-current", getPriorityFlagClass(priority))}
      />
      {getPriorityLabel(priority, t)}
    </span>
  );
}

type Props = {
  value: TaskPriority;
  onValueChange: (value: TaskPriority) => void;
  disabled?: boolean;
  size?: "sm" | "default";
  className?: string;
  id?: string;
  iconOnly?: boolean;
  ariaLabel?: string;
};

export function TaskPrioritySelect({
  value,
  onValueChange,
  disabled,
  size = "default",
  className,
  id,
  iconOnly = false,
  ariaLabel,
}: Props) {
  return (
    <Select
      value={value}
      onValueChange={v => onValueChange(v as TaskPriority)}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        size={size}
        aria-label={ariaLabel}
        className={cn("h-7!", className)}
      >
        {iconOnly ? (
          <Flag
            className={cn("h-4 w-4 fill-current", getPriorityFlagClass(value))}
          />
        ) : (
          <SelectValue />
        )}
      </SelectTrigger>
      <SelectContent position={iconOnly ? "popper" : "item-aligned"}>
        {Object.values(TASK_PRIORITIES).map(priority => (
          <SelectItem key={priority} value={priority}>
            <PriorityOptionLabel priority={priority} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
