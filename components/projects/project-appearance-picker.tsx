"use client";

import { FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  const [colorOpen, setColorOpen] = useState(false);
  const [iconOpen, setIconOpen] = useState(false);

  const color = useWatch({ control, name: "color" });

  return (
    <div className="flex items-center gap-6">
      <Controller
        control={control}
        name="color"
        render={({ field }) => (
          <div className="flex items-center gap-2">
            <FieldLabel>{t("color_label")}</FieldLabel>
            <Popover open={colorOpen} onOpenChange={setColorOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center justify-center h-8 w-8 rounded-md border hover:bg-accent transition-colors"
                  aria-label={t("color_label")}
                >
                  <span
                    className={cn(
                      "h-4 w-4 rounded-full",
                      getProjectColorBgClass(field.value),
                    )}
                  />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="grid grid-cols-8 gap-1">
                  {Object.values(PROJECT_COLORS).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        field.onChange(c);
                        setColorOpen(false);
                      }}
                      className={cn(
                        "flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors",
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
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      />

      <Controller
        control={control}
        name="icon"
        render={({ field }) => {
          const SelectedIcon = getProjectIcon(field.value);

          return (
            <div className="flex items-center gap-2">
              <FieldLabel>{t("icon_label")}</FieldLabel>
              <Popover open={iconOpen} onOpenChange={setIconOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center justify-center h-8 w-8 rounded-md border hover:bg-accent transition-colors"
                    aria-label={t("icon_label")}
                  >
                    <SelectedIcon
                      className={cn(
                        "h-4 w-4",
                        getProjectColorTextClass(color),
                      )}
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                  <div className="grid grid-cols-8 gap-1">
                    {Object.values(PROJECT_ICONS).map(icon => {
                      const Icon = getProjectIcon(icon);

                      return (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => {
                            field.onChange(icon);
                            setIconOpen(false);
                          }}
                          className={cn(
                            "flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors",
                            field.value === icon && "bg-accent ring-1 ring-ring",
                          )}
                          aria-label={icon}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4",
                              getProjectColorTextClass(color),
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          );
        }}
      />
    </div>
  );
}
