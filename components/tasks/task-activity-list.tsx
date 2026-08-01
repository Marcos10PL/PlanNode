"use client";

import { useUser } from "@/components/providers/user-provider";
import { InfoPopover } from "@/components/ui/info-popover";
import { TASK_EVENT_TYPES } from "@/const";
import {
  AssigneeChangedMetadata,
  DueDateChangedMetadata,
  PriorityChangedMetadata,
  StatusChangedMetadata,
  TaskEvent,
} from "@/types/dto";
import { formatDate } from "@/utils";
import { useLocale, useTranslations } from "next-intl";

type Props = {
  events: TaskEvent[];
  isLoading: boolean;
};

export function TaskActivityList({ events, isLoading }: Props) {
  const t = useTranslations("tasks.activity");
  const tTasks = useTranslations("tasks");
  const locale = useLocale();
  const { user: currentUser } = useUser();

  const renderEmailInfo = (email: string | null) =>
    email ? (
      <InfoPopover
        label={t("show_email")}
        variant="ghost"
        className="size-5 text-muted-foreground [&_svg]:size-3.5"
      >
        {email}
      </InfoPopover>
    ) : null;

  const describeEvent = (event: TaskEvent) => {
    switch (event.type) {
      case TASK_EVENT_TYPES.TASK_CREATED:
        return t("task_created");
      case TASK_EVENT_TYPES.STATUS_CHANGED: {
        const { from, to } = event.metadata as StatusChangedMetadata;
        return t("status_changed", {
          from: tTasks(`status_${from}`),
          to: tTasks(`status_${to}`),
        });
      }
      case TASK_EVENT_TYPES.PRIORITY_CHANGED: {
        const { from, to } = event.metadata as PriorityChangedMetadata;
        return t("priority_changed", {
          from: tTasks(`priority_${from}`),
          to: tTasks(`priority_${to}`),
        });
      }
      case TASK_EVENT_TYPES.ASSIGNEE_CHANGED: {
        const { fromName, fromEmail, toName, toEmail } =
          event.metadata as AssigneeChangedMetadata;

        return t.rich("assignee_changed", {
          from: fromName ?? tTasks("no_assignee"),
          to: toName ?? tTasks("no_assignee"),
          fromInfo: chunks => (
            <span className="inline-flex items-center gap-0.5">
              {chunks}
              {renderEmailInfo(fromEmail)}
            </span>
          ),
          toInfo: chunks => (
            <span className="inline-flex items-center gap-0.5">
              {chunks}
              {renderEmailInfo(toEmail)}
            </span>
          ),
        });
      }
      case TASK_EVENT_TYPES.DUE_DATE_CHANGED: {
        const { from, to } = event.metadata as DueDateChangedMetadata;

        if (!from && to) {
          return t("due_date_set", { to: formatDate(to, locale) });
        }

        if (from && !to) {
          return t("due_date_removed");
        }

        return t("due_date_changed", {
          from: formatDate(from, locale),
          to: formatDate(to, locale),
        });
      }
      default:
        return null;
    }
  };

  if (events.length === 0 || isLoading) {
    return (
      <div className={"text-sm text-muted-foreground h-114.5"}>
        {isLoading ? t("loading") : t("empty")}
      </div>
    );
  }

  return (
    <div className={"flex flex-col gap-2.5 h-114.5 overflow-y-auto"}>
      {events.map(event => {
        const isCurrentUser = event.user?.id === currentUser.id;

        return (
          <div key={event.id} className="text-xs italic">
            <div className="opacity-90">{describeEvent(event)}</div>
            <div className="text-muted-foreground mt-0.5 flex items-center gap-0.5">
              <span>
                {isCurrentUser
                  ? t("you")
                  : (event.user?.fullName ?? t("unknown_user"))}
              </span>
              {!isCurrentUser && renderEmailInfo(event.user?.email ?? null)}
              <span>· {formatDate(event.createdAt, locale)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
