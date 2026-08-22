"use client";

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
import { TaskEventAuthor } from "./task-event-author";

type Props = {
  event: TaskEvent;
};

export function TaskTimelineEvent({ event }: Props) {
  const t = useTranslations("tasks.activity");
  const tTasks = useTranslations("tasks");
  const locale = useLocale();

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

  const describeEvent = () => {
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

  return (
    <div className="text-xs italic">
      <div className="opacity-90">{describeEvent()}</div>
      <div className="text-muted-foreground mt-0.5 flex items-center gap-0.5">
        <TaskEventAuthor user={event.user} />
        <span>· {formatDate(event.createdAt, locale)}</span>
      </div>
    </div>
  );
}
