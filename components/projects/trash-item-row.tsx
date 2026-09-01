"use client";

import { DeleteButton } from "@/components/ui/delete-button";
import { FormattedDate } from "@/components/ui/formatted-date";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { RotateCcw } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

type Props = {
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  postfix?: React.ReactNode;
  deletedAt: string | null;
  onRestore: () => void;
  isRestorePending?: boolean;
  canRestore?: boolean;
  canDelete?: boolean;
  onDelete: () => void;
  isDeletePending?: boolean;
};

export function TrashItemRow({
  icon,
  title,
  subtitle,
  postfix,
  deletedAt,
  onRestore,
  isRestorePending,
  canRestore,
  canDelete,
  onDelete,
  isDeletePending,
}: Props) {
  const t = useTranslations("common");
  const locale = useLocale();

  return (
    <div className="flex items-center gap-2 rounded-md border p-3">
      <div className="flex-1 min-w-0 gap-1 flex flex-col">
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <p className="truncate text-sm">{title}</p>
        </div>
        {subtitle && (
          <p className="truncate text-xs text-muted-foreground -mt-1.5">
            {subtitle}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {t.rich("deleted_at", {
            date: () => <FormattedDate value={deletedAt} locale={locale} />,
          })}
          {postfix && <> {postfix}</>}
        </p>
      </div>
      {canRestore && (
        <TooltipIconButton
          icon={RotateCcw}
          label={t("restore")}
          onClick={onRestore}
          disabled={isRestorePending}
        />
      )}
      {canDelete && (
        <DeleteButton onClick={onDelete} disabled={isDeletePending} />
      )}
    </div>
  );
}
