"use client";

import { getMoreNotificationsAction } from "@/actions/notifications/get-more-notifications";
import { Notification } from "@/types/dto";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { NotificationItem } from "./notification-item";

type Props = {
  initialNotifications: Notification[];
  initialHasMore: boolean;
};

export function NotificationList({
  initialNotifications,
  initialHasMore,
}: Props) {
  const t = useTranslations("notifications");

  const [notifications, setNotifications] = useState(initialNotifications);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    setNotifications(initialNotifications);
    setHasMore(initialHasMore);
  }, [initialNotifications, initialHasMore]);

  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || loadingRef.current) return;

        loadingRef.current = true;
        setIsLoading(true);
        try {
          const result = await getMoreNotificationsAction(notifications.length);
          setNotifications(prev => [...prev, ...result.notifications]);
          setHasMore(result.hasMore);
        } finally {
          loadingRef.current = false;
          setIsLoading(false);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, notifications.length]);

  return (
    <div className="flex flex-col gap-4">
      {notifications.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <>
          <div className="flex flex-col divide-y">
            {notifications.map(n => (
              <NotificationItem key={n.id} notification={n} />
            ))}
          </div>
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-2">
              {isLoading && (
                <span className="text-xs text-muted-foreground">
                  {t("loading_more")}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
