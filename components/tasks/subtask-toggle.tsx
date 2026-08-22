"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils";
import { LayoutList } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  done: number;
  total: number;
  expanded: boolean;
  onToggle: () => void;
};

export function SubtaskToggle({ done, total, expanded, onToggle }: Props) {
  const t = useTranslations("tasks");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={expanded ? "secondary" : "outline"}
          size="icon"
          className={cn(
            "h-7 min-w-fit",
            total > 0 ? "px-1.5" : "px-0.5 w-7",
            expanded && "border border-transparent",
          )}
          onClick={onToggle}
        >
          <LayoutList className="size-4" />
          {total > 0 && (
            <span className="text-xs text-muted-foreground">
              {done}/{total}
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{t("subtasks")}</TooltipContent>
    </Tooltip>
  );
}
