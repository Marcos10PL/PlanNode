"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TASK_VIEWS, TaskView } from "@/const";
import { cn } from "@/utils";
import { LayoutGrid, List } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  value: TaskView;
  onChange: (view: TaskView) => void;
  showLabels?: boolean;
};

const OPTIONS = [
  { value: TASK_VIEWS.LIST, icon: List },
  { value: TASK_VIEWS.KANBAN, icon: LayoutGrid },
] as const;

export function TaskViewToggle({ value, onChange, showLabels }: Props) {
  const t = useTranslations("tasks.view");

  return (
    <div className="flex w-fit items-center gap-0.5 rounded-md border p-0.5">
      {OPTIONS.map(({ value: option, icon: Icon }) => {
        const button = (
          <Button
            type="button"
            variant={value === option ? "secondary" : "ghost"}
            size={showLabels ? "sm" : "icon"}
            className={cn("h-7", !showLabels && "w-7 px-0")}
            onClick={() => onChange(option)}
          >
            <Icon className="size-4" />
            {showLabels && t(option)}
          </Button>
        );

        if (showLabels) {
          return <span key={option}>{button}</span>;
        }

        return (
          <Tooltip key={option}>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>{t(option)}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
