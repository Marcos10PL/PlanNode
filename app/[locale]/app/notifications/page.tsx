import { NotificationList } from "@/components/notifications/notification-list";
import { NotificationSettingsButton } from "@/components/notifications/notification-settings-button";
import { NotificationsActions } from "@/components/notifications/notifications-actions";
import { SubHeader } from "@/components/sub-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  getNotificationPreferences,
  getNotifications,
  getNotificationsCount,
  getUnreadNotificationsCount,
} from "@/lib/data";
import { getTranslations } from "next-intl/server";

export default async function NotificationsPage() {
  const t = await getTranslations("notifications");

  const [{ notifications, hasMore }, totalCount, unreadCount, preferences] =
    await Promise.all([
      getNotifications(),
      getNotificationsCount(),
      getUnreadNotificationsCount(),
      getNotificationPreferences(),
    ]);

  const allDisabled = preferences.every(
    p => !p.emailEnabled && !p.inAppEnabled,
  );

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-4 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <SubHeader title={t("title")} className="my-0" />
          <NotificationSettingsButton preferences={preferences} />
        </div>
        <NotificationsActions
          hasUnread={unreadCount > 0}
          hasNotifications={totalCount > 0}
          className="self-end"
        />
      </div>

      {allDisabled && (
        <div className="mb-2">
          <Alert variant="destructive">
            <AlertTitle>{t("all_disabled_title")}</AlertTitle>
            <AlertDescription>{t("all_disabled_description")}</AlertDescription>
          </Alert>
        </div>
      )}

      <NotificationList
        initialNotifications={notifications}
        initialHasMore={hasMore}
      />
    </>
  );
}
