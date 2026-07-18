"use client";

import { updateTaskAction } from "@/actions/task/update-task";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { cn, formatDate } from "@/utils";
import { CalendarIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  taskId: string;
  dueDate: string | null;
  isOverdue: boolean;
  canEdit: boolean;
};

export function TaskDueDatePopover({
  taskId,
  dueDate,
  isOverdue,
  canEdit,
}: Props) {
  const t = useTranslations();
  const locale = useLocale();
  const [isPending, setIsPending] = useState(false);

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

  const handleChange = async (value: string | null) => {
    if (value === dueDate) return;

    setIsPending(true);
    try {
      const result = await updateTaskAction(taskId, { dueDate: value });
      if (result?.error) toast.error(t("tasks.due_date_change_error"));
    } catch {
      toast.error(t("common.unexpected_error"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <DatePicker
      value={dueDate}
      onChange={handleChange}
      disabled={isPending}
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
          disabled={isPending}
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
