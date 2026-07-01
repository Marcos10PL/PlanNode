import { getUnreadNotificationsCount } from "@/lib/data";
import { NotificationLink } from "./notification-link";

export async function NotificationsIndicator() {
  const count = await getUnreadNotificationsCount();

  return <NotificationLink count={count} />;
}
