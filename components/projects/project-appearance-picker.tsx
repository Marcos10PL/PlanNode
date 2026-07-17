"use client";

import { Button } from "@/components/ui/button";
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
import { PROJECT_COLORS, PROJECT_ICONS } from "@/const";
import { CreateProjectSchema } from "@/schema";
import {
  cn,
  getProjectColorBgClass,
  getProjectColorTextClass,
  getProjectIcon,
} from "@/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Control, Controller, useWatch } from "react-hook-form";

type Props = {
  control: Control<CreateProjectSchema>;
};

export function ProjectAppearancePicker({ control }: Props) {
  const t = useTranslations("projects.appearance");
  const [open, setOpen] = useState(false);

  const color = useWatch({ control, name: "color" });
  const icon = useWatch({ control, name: "icon" });

  const SelectedIcon = getProjectIcon(icon);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              aria-label={t("trigger_label")}
            >
              <SelectedIcon
                className={cn("h-4 w-4", getProjectColorTextClass(color))}
              />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{t("trigger_label")}</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-auto p-2" align="end">
        <Controller
          control={control}
          name="color"
          render={({ field }) => (
            <div className="grid grid-cols-8 gap-1">
              {Object.values(PROJECT_COLORS).map(c => (
                <Button
                  key={c}
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => field.onChange(c)}
                  className={cn(
                    "h-8 w-8",
                    field.value === c && "bg-accent ring-1 ring-ring",
                  )}
                  aria-label={c}
                >
                  <span
                    className={cn(
                      "h-4 w-4 rounded-full",
                      getProjectColorBgClass(c),
                    )}
                  />
                </Button>
              ))}
            </div>
          )}
        />

        <Controller
          control={control}
          name="icon"
          render={({ field }) => (
            <div className="mt-2 grid grid-cols-8 gap-1 border-t pt-2">
              {Object.values(PROJECT_ICONS).map(i => {
                const Icon = getProjectIcon(i);

                return (
                  <Button
                    key={i}
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => field.onChange(i)}
                    className={cn(
                      "h-8 w-8",
                      field.value === i && "bg-accent ring-1 ring-ring",
                    )}
                    aria-label={i}
                  >
                    <Icon
                      className={cn("h-4 w-4", getProjectColorTextClass(color))}
                    />
                  </Button>
                );
              })}
            </div>
          )}
        />
      </PopoverContent>
    </Popover>
  );
}
