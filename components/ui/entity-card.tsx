"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { TaskProgress } from "@/components/ui/task-progress";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";

type Props = {
  href: string;
  title: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  progress: { total: number; done: number; cancelled: number };
};

export function EntityCard({
  href,
  title,
  icon,
  badge,
  description,
  actions,
  progress,
}: Props) {
  const t = useTranslations("common");

  return (
    <Card className="relative min-w-0 hover:bg-accent/50 transition-colors">
      <Link href={href} className="absolute inset-0" aria-label={title} />
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          {icon}
          <span className="min-w-0 flex-1 text-sm font-medium truncate">
            {title}
          </span>
          {badge}
          {description && (
            <Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 relative z-10 -my-1"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>{t("description")}</TooltipContent>
              </Tooltip>
              <PopoverContent className="text-sm" align="end">
                {description}
              </PopoverContent>
            </Popover>
          )}
          {actions && (
            <div className="shrink-0 relative z-10 -my-1">{actions}</div>
          )}
        </div>

        <TaskProgress
          total={progress.total}
          done={progress.done}
          cancelled={progress.cancelled}
          size="sm"
          className="mt-2"
        />
      </CardContent>
    </Card>
  );
}
