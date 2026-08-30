"use client";

import { deleteNotificationAction } from "@/actions/notifications/delete-notification";
import { markNotificationReadAction } from "@/actions/notifications/mark-read";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { ConfirmModal } from "../ui/confirm-modal";

type Props = {
  className?: string;
  hasUnread: boolean;
  hasNotifications: boolean;
};

export function NotificationsActions({
  className,
  hasUnread,
  hasNotifications,
}: Props) {
  const t = useTranslations("notifications");
  const tCommon = useTranslations("common");

  const [isDeletingAll, startDeleteAllTransition] = useTransition();
  const [isMarkingAllRead, startMarkAllReadTransition] = useTransition();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleDeleteAll = () => {
    startDeleteAllTransition(async () => {
      try {
        await deleteNotificationAction({ deleteAll: true });
      } catch {
        toast.error(tCommon("unexpected_error"));
      }
    });
  };

  const handleMarkAllRead = () => {
    startMarkAllReadTransition(async () => {
      try {
        await markNotificationReadAction({ markAll: true });
      } catch {
        toast.error(tCommon("unexpected_error"));
      }
    });
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex gap-2">
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          disabled={isMarkingAllRead || !hasUnread}
          onClick={handleMarkAllRead}
        >
          {t("mark_all_read")}
        </Button>

        <Button
          type="submit"
          variant="outline"
          size="sm"
          disabled={isDeletingAll || !hasNotifications}
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
