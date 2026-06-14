"use client";

import { Notification } from "@/types/dto";
import { useTranslations } from "next-intl";
import { NotificationItem } from "./notification-item";

type Props = {
  notifications: Notification[];
};

export function NotificationList({ notifications }: Props) {
  const t = useTranslations("notifications");

  return (
    <div className="flex flex-col gap-4">
      {notifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="flex flex-col divide-y">
          {notifications.map(n => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
}
