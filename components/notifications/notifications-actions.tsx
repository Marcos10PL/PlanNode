"use client";

import { deleteNotificationAction } from "@/actions/notifications/delete-notification";
import { markNotificationReadAction } from "@/actions/notifications/mark-read";
import { Notification } from "@/types/dto";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { ConfirmModal } from "../ui/confirm-modal";

type Props = {
  className?: string;
  notifications: Notification[];
};

export function NotificationsActions({ className, notifications }: Props) {
  const t = useTranslations("notifications");
  const tCommon = useTranslations("common");

  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const hasUnread = notifications.some(n => !n.readAt);

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      await deleteNotificationAction({ deleteAll: true });
    } catch {
      toast.error(tCommon("unexpected_error"));
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleMarkAllRead = async () => {
    setIsMarkingAllRead(true);
    try {
      await markNotificationReadAction({ markAll: true });
    } catch {
      toast.error(tCommon("unexpected_error"));
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  return (
    <div className={cn("flex flex-col mt-4 mb-6", className)}>
      <div className="flex gap-2">
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          disabled={
            isMarkingAllRead || !hasUnread || notifications.length === 0
          }
          onClick={handleMarkAllRead}
        >
          {t("mark_all_read")}
        </Button>

        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={isDeletingAll || notifications.length === 0}
          onClick={() => setIsConfirmModalOpen(true)}
        >
          {t("delete_all")}
        </Button>
      </div>

      <ConfirmModal
        open={isConfirmModalOpen}
        onOpenChange={setIsConfirmModalOpen}
        onConfirm={handleDeleteAll}
        title={t("delete_all_confirm_title")}
        description={t("delete_all_confirm_description")}
        isPending={isDeletingAll}
      />
    </div>
  );
}
