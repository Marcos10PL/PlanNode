"use client";

import { Card, CardContent } from "@/components/ui/card";
import { InfoPopover } from "@/components/ui/info-popover";
import { TaskProgress } from "@/components/ui/task-progress";
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
            <InfoPopover
              label={t("description")}
              variant="ghost"
              className="size-7 shrink-0 relative z-10 -my-1 [&_svg]:size-4"
            >
              {description}
            </InfoPopover>
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
