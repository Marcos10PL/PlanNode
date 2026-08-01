"use client";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { cn, formatDate } from "@/utils";
import { CalendarIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

type Props = {
  dueDate: string | null;
  isOverdue: boolean;
  canEdit: boolean;
  onChange: (value: string | null) => void;
};

export function TaskDueDatePopover({
  dueDate,
  isOverdue,
  canEdit,
  onChange,
}: Props) {
  const t = useTranslations();
  const locale = useLocale();

  if (!canEdit) {
    return dueDate ? (
      <span
        className={cn(
          "text-xs shrink-0",
          isOverdue ? "text-destructive font-medium" : "text-muted-foreground",
        )}
      >
        {formatDate(dueDate, locale)}
      </span>
    ) : null;
  }

  const handleChange = (value: string | null) => {
    if (value === dueDate) return;
    onChange(value);
  };

  return (
    <DatePicker
      value={dueDate}
      onChange={handleChange}
      align="end"
      tooltip={t("tasks.set_due_date")}
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 shrink-0 gap-1.5 px-2 text-xs font-normal",
            isOverdue
              ? "text-destructive font-medium"
              : "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-4" />
          <span
            className={cn("w-16 text-left tabular-nums", !dueDate && "pl-0.5")}
          >
            {dueDate ? formatDate(dueDate, locale) : "-- . -- . ----"}
          </span>
        </Button>
      }
    />
  );
}
