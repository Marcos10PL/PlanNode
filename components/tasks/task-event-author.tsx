"use client";

import { useUser } from "@/components/providers/user-provider";
import { InfoPopover } from "@/components/ui/info-popover";
import { TaskEventUser } from "@/types/dto";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";

type Props = {
  user: TaskEventUser | null;
};

export function TaskEventAuthor({ user }: Props) {
  const t = useTranslations("tasks.activity");
  const { user: currentUser } = useUser();
  const isCurrentUser = user?.id === currentUser.id;

  return (
    <>
      <span className={cn("truncate", !user && "italic")}>
        {isCurrentUser ? t("you") : (user?.fullName ?? t("unknown_user"))}
      </span>
      {!isCurrentUser && user?.email && (
        <InfoPopover
          label={t("show_email")}
          variant="ghost"
          className="size-5 text-muted-foreground [&_svg]:size-3.5"
        >
          {user.email}
        </InfoPopover>
      )}
    </>
  );
}
