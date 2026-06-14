import { NotificationList } from "@/components/notifications/notification-list";
import { NotificationsActions } from "@/components/notifications/notifications-actions";
import { SubHeader } from "@/components/sub-header";
import { getNotifications } from "@/lib/data";
import { getTranslations } from "next-intl/server";

export default async function NotificationsPage() {
  const t = await getTranslations("notifications");

  const notifications = await getNotifications();

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <SubHeader title={t("title")} className="mb-0 md:mb-6" />
        <NotificationsActions
          notifications={notifications}
          className="self-end"
        />
      </div>
      <NotificationList notifications={notifications} />
    </>
  );
}
