"use client";

import { LINKS } from "@/const";
import { createClient } from "@/lib/supabase/client";
import { Bell } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  count: number;
};

export function NotificationLink({ count }: Props) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => router.refresh(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return (
    <Link
      href={LINKS.NOTIFICATIONS}
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
