"use client";

import { deleteNotificationAction } from "@/actions/notifications/delete-notification";
import { markNotificationReadAction } from "@/actions/notifications/mark-read";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { Notification } from "@/types/dto";
import { cn, formatDate } from "@/utils";
import { ExternalLink } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmModal } from "../ui/confirm-modal";

type Props = {
  notification: Notification;
  onDeleted: (id: string) => void;
  onMarkedRead: (id: string) => void;
};

export function NotificationItem({
  notification,
  onDeleted,
  onMarkedRead,
}: Props) {
  const t = useTranslations("notifications");
  const tCommon = useTranslations("common");

  const router = useRouter();
  const locale = useLocale();

  const [isPending, startDeleteTransition] = useTransition();
  const [markReadPending, setMarkReadPending] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const isUnread = !notification.readAt;

  const handleMarkRead = async () => {
    if (!isUnread) return;
    setMarkReadPending(true);
    try {
      const result = await markNotificationReadAction({ id: notification.id });
      if (result?.error) {
        toast.error(tCommon("unexpected_error"));
      } else {
        onMarkedRead(notification.id);
      }
    } catch {
      toast.error(tCommon("unexpected_error"));
    } finally {
      setMarkReadPending(false);
    }
  };

  const handleView = async () => {
    await handleMarkRead();

    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      try {
        const result = await deleteNotificationAction({ id: notification.id });
        if (result?.error) {
          toast.error(tCommon("unexpected_error"));
        } else {
          toast.success(t("delete"));
          onDeleted(notification.id);
        }
      } catch {
        toast.error(tCommon("unexpected_error"));
      }
    });
  };

  return (
    <div className="flex items-start gap-3 py-3">
      <div className={cn("flex-1 min-w-0", !isUnread && "opacity-65")}>
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm">
            {t(
              `${notification.type}_title`,
              (notification.metadata as Record<string, string>) ?? {},
            )}
          </p>
          {isUnread && (
            <Badge className="shrink-0 text-xs py-0">{t("new_badge")}</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDate(notification.createdAt, locale)}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {notification.link && (
          <TooltipIconButton
            icon={ExternalLink}
            label={t("view")}
            onClick={handleView}
            disabled={markReadPending}
            className="text-primary"
          />
        )}

        <DeleteButton
          onClick={() => setIsConfirmModalOpen(true)}
          disabled={isPending}
        />
      </div>

      <ConfirmModal
        open={isConfirmModalOpen}
        onOpenChange={setIsConfirmModalOpen}
        onConfirm={handleDelete}
        title={t("delete_confirm_title")}
        description={t("delete_confirm_description")}
        isPending={isPending}
      />
    </div>
  );
}
