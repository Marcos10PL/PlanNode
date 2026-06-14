import { deleteNotificationAction } from "@/actions/notifications/delete-notification";
import { markNotificationReadAction } from "@/actions/notifications/mark-read";
import { NotificationItem } from "@/components/notifications/notification-item";
import { Button } from "@/components/ui/button";
import { getNotifications } from "@/lib/data";
import { getTranslations } from "next-intl/server";

export default async function NotificationsPage() {
  const t = await getTranslations("notifications");
  const notifications = await getNotifications();
  const hasUnread = notifications.some(n => !n.readAt);

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {hasUnread && (
              <form
                action={async () => {
                  "use server";
                  await markNotificationReadAction({ markAll: true });
                }}
              >
                <Button type="submit" variant="outline" size="sm">
                  {t("mark_all_read")}
                </Button>
              </form>
            )}
            <form
              action={async () => {
                "use server";
                await deleteNotificationAction({ deleteAll: true });
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                {t("delete_all")}
              </Button>
            </form>
          </div>
        )}
      </div>

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
