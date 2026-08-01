"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, formatDate } from "@/utils";
import { CalendarIcon, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ReactNode, useState } from "react";
import { enUS, pl } from "react-day-picker/locale";

type Props = {
  value: string | null;
  onChange: (value: string | null) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
  trigger?: ReactNode;
  tooltip?: string;
  align?: "start" | "center" | "end";
};

const toDate = (value: string | null) => {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function DatePicker({
  value,
  onChange,
  id,
  disabled,
  className,
  trigger,
  tooltip,
  align = "start",
}: Props) {
  const t = useTranslations("common");
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const selected = toDate(value);

  const handleSelect = (date: Date | undefined) => {
    onChange(date ? toIsoDate(date) : null);
    setOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setOpen(false);
  };

  const triggerButton = trigger ?? (
    <Button
      id={id}
      type="button"
      variant="outline"
      disabled={disabled}
      className={cn("w-full justify-start gap-2 font-normal", className)}
    >
      <CalendarIcon className="size-4 text-muted-foreground" />
      {value ? (
        formatDate(value, locale)
      ) : (
        <span className="text-muted-foreground">{t("pick_date")}</span>
      )}
    </Button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      ) : (
        <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      )}
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={handleSelect}
          locale={locale === "pl" ? pl : enUS}
        />
        {value && (
          <div className="border-t p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={handleClear}
            >
              <X className="size-4" />
              {t("clear_date")}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
