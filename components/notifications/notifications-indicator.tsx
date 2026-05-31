import { LINKS } from "@/const";
import { getUnreadNotificationsCount } from "@/lib/data";
import { Bell } from "lucide-react";
import Link from "next/link";

export async function NotificationsIndicator() {
  const count = await getUnreadNotificationsCount();

  return (
    <Link
      href={LINKS.notifications}
      className="relative inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors"
      aria-label="Notifications"
    >
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
