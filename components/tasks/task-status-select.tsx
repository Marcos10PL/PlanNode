"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TASK_STATUS_ORDER } from "@/const";
import { TaskStatus } from "@/types/entities";
import { cn, getStatusDotClass, getStatusLabel } from "@/utils";
import { useTranslations } from "next-intl";

type Props = {
  value: TaskStatus;
  onValueChange: (value: TaskStatus) => void;
  disabled?: boolean;
  size?: "sm" | "default";
  className?: string;
  id?: string;
};

export function TaskStatusSelect({
  value,
  onValueChange,
  disabled,
  size = "default",
  className,
  id,
}: Props) {
  const t = useTranslations();

  return (
    <Select
      value={value}
      onValueChange={v => onValueChange(v as TaskStatus)}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        size={size}
        hideChevron={disabled}
        className={cn(
          "h-7!",
          disabled &&
            "disabled:pointer-events-none disabled:cursor-default disabled:opacity-100",
          className,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TASK_STATUS_ORDER.map(status => (
          <SelectItem key={status} value={status}>
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  getStatusDotClass(status),
                )}
              />
              {getStatusLabel(status, t)}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
