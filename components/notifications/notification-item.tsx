"use client";

import { deleteNotificationAction } from "@/actions/notifications/delete-notification";
import { markNotificationReadAction } from "@/actions/notifications/mark-read";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Notification } from "@/types/entities";
import { ExternalLink, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function NotificationItem({ notification }: { notification: Notification }) {
  const t = useTranslations("notifications");
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const isUnread = !notification.read_at;

  const handleView = async () => {
    if (isUnread) {
      await markNotificationReadAction({ id: notification.id });
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleDelete = async () => {
    setIsPending(true);
    await deleteNotificationAction({ id: notification.id });
    setIsPending(false);
    toast.success(t("delete"));
  };

  return (
    <div className={`flex items-start gap-3 py-3 ${isUnread ? "font-medium" : ""}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm truncate">
            {t(`${notification.type}_title`, notification.metadata ?? {})}
          </p>
          {isUnread && (
            <Badge variant="default" className="shrink-0 text-xs py-0">
              {t("new_badge")}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date(notification.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {notification.link && (
          <Button variant="ghost" size="icon" onClick={handleView} title={t("view")}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={isPending}
          title={t("delete")}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
