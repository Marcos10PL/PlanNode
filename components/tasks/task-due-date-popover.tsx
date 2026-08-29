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
  noPlaceholder?: boolean;
};

export function TaskDueDatePopover({
  dueDate,
  isOverdue,
  canEdit,
  onChange,
  noPlaceholder = false,
}: Props) {
  const t = useTranslations();
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const tooltip = dueDate ? t("tasks.set_due_date") : tCommon("no_due_date");

  const content = (
    <>
      <CalendarIcon className="size-4" />
      <span
        className={cn(
          "w-16 text-left tabular-nums",
          !dueDate && "pl-0.5",
          noPlaceholder && !dueDate && "hidden",
        )}
      >
        {dueDate ? formatDate(dueDate, locale) : "-- . -- . ----"}
      </span>
    </>
  );

  if (!canEdit) {
    if (noPlaceholder && !dueDate) return null;

    return (
      <span
        className={cn(
          "inline-flex h-7 shrink-0 cursor-default items-center gap-1.5 rounded-md px-2 text-xs font-normal",
          isOverdue ? "text-destructive font-medium" : "text-muted-foreground",
        )}
      >
        {content}
      </span>
    );
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
      tooltip={tooltip}
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
          {content}
        </Button>
      }
    />
  );
}
