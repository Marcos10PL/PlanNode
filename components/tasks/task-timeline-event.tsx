"use client";

import { FormattedDate } from "@/components/ui/formatted-date";
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
        const { fromId, fromName, fromEmail, toId, toName, toEmail } =
          event.metadata as AssigneeChangedMetadata;

        const describeAssignee = (id: string | null, name?: string | null) =>
          id === null ? tTasks("no_assignee") : (name ?? t("unknown_user"));

        return t.rich("assignee_changed", {
          from: describeAssignee(fromId, fromName),
          to: describeAssignee(toId, toName),
          fromInfo: chunks => (
            <span className="inline-flex items-center gap-0.5">
              {chunks}
              {renderEmailInfo(fromEmail ?? null)}
            </span>
          ),
          toInfo: chunks => (
            <span className="inline-flex items-center gap-0.5">
              {chunks}
              {renderEmailInfo(toEmail ?? null)}
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
        <span>
          · <FormattedDate value={event.createdAt} locale={locale} />
        </span>
      </div>
    </div>
  );
}
