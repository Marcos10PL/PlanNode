"use client";

import { cn, getProjectProgress } from "@/utils";
import { useTranslations } from "next-intl";

type Props = {
  total: number;
  done: number;
  cancelled: number;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
};

export function TaskProgress({
  total,
  done,
  cancelled,
  size = "md",
  className,
}: Props) {
  const t = useTranslations("projects");
  const progress = getProjectProgress(total, done, cancelled);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{t("progress")}</span>
        <span>{progress}%</span>
      </div>

      <div
        className={`${size === "sm" ? "h-1.5" : "h-2"} rounded-full bg-accent overflow-hidden`}
      >
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t("task_count", { done, total: total - cancelled })}</span>
      </div>
    </div>
  );
}
