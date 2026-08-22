"use client";

import { TaskTimelineItem } from "@/types/dto";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { TaskCommentCard } from "./task-comment-card";
import { TaskCommentComposer } from "./task-comment-composer";
import { TaskTimelineEvent } from "./task-timeline-event";

type Props = {
  taskId: string;
  items: TaskTimelineItem[];
  isLoading: boolean;
  canComment: boolean;
  canManageComments: boolean;
  onChanged: () => Promise<void>;
};

export function TaskActivityList({
  taskId,
  items,
  isLoading,
  canComment,
  canManageComments,
  onChanged,
}: Props) {
  const t = useTranslations("tasks.activity");
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevItemCountRef = useRef(0);

  useEffect(() => {
    if (!isLoading) {
      if (items.length > prevItemCountRef.current && scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
      prevItemCountRef.current = items.length;
    }
  }, [isLoading, items]);

  return (
    <div className="flex flex-col">
      {isLoading || items.length === 0 ? (
        <div className="text-sm text-muted-foreground h-120">
          {isLoading ? t("loading") : t("empty")}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex flex-col gap-2.5 h-120 overflow-y-auto pr-2 divide-accent divide-y [&>div]:pb-2.5"
        >
          {items.map(item =>
            item.kind === "event" ? (
              <TaskTimelineEvent key={`event-${item.id}`} event={item} />
            ) : (
              <TaskCommentCard
                key={`comment-${item.id}`}
                comment={item}
                canManageComments={canManageComments}
                onChanged={onChanged}
                scrollContainerRef={scrollRef}
              />
            ),
          )}
        </div>
      )}

      {canComment && (
        <TaskCommentComposer taskId={taskId} onChanged={onChanged} />
      )}
    </div>
  );
}
