"use client";

import { deleteNotificationAction } from "@/actions/notifications/delete-notification";
import { markNotificationReadAction } from "@/actions/notifications/mark-read";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Notification } from "@/types/dto";
import { cn, formatDate } from "@/utils";
import { ExternalLink, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmModal } from "../ui/confirm-modal";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function NotificationItem({
  notification,
}: {
  notification: Notification;
}) {
  const t = useTranslations("notifications");
  const tCommon = useTranslations("common");

  const router = useRouter();
  const locale = useLocale();

  const [isPending, setIsPending] = useState(false);
  const [markReadPending, setMarkReadPending] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const isUnread = !notification.readAt;

  const handleMarkRead = async () => {
    setMarkReadPending(true);
    try {
      await markNotificationReadAction({ id: notification.id });
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

  const handleDelete = async () => {
    setIsPending(true);
    try {
      await deleteNotificationAction({ id: notification.id });
      toast.success(t("delete"));
    } catch {
      toast.error(tCommon("unexpected_error"));
    } finally {
      setIsPending(false);
    }
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary"
                disabled={markReadPending}
                onClick={handleView}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("view")}</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              disabled={isPending}
              onClick={() => setIsConfirmModalOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t("delete")}</TooltipContent>
        </Tooltip>
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
