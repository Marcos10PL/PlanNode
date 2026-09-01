"use client";

import { TaskRow } from "@/components/tasks/task-row";
import { Button } from "@/components/ui/button";
import { TASK_URGENCY_BUCKET_ORDER, TaskUrgencyBucket } from "@/const";
import { useOptimisticTaskUpdate } from "@/hooks/use-optimistic-task-update";
import { MyTask, WorkspaceMember } from "@/types/dto";
import { cn, getTaskUrgencyBucket, getTaskUrgencyBucketLabel } from "@/utils";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type Props = {
  tasks: MyTask[];
  members: WorkspaceMember[];
  canEdit: boolean;
  canManage: boolean;
};

export function MyTasksSection({
  tasks: initialTasks,
  members,
  canEdit,
  canManage,
}: Props) {
  const t = useTranslations("dashboard");
  const tRoot = useTranslations();

  const [tasks, setTasks] = useState<MyTask[]>(initialTasks);
  const [collapsed, setCollapsed] = useState<Set<TaskUrgencyBucket>>(new Set());
  const [prevInitialTasks, setPrevInitialTasks] = useState(initialTasks);

  if (initialTasks !== prevInitialTasks) {
    setPrevInitialTasks(initialTasks);
    setTasks(initialTasks);
  }

  const updateTaskField = useOptimisticTaskUpdate(tasks, setTasks);

  const toggleBucket = (bucket: TaskUrgencyBucket) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(bucket)) {
        next.delete(bucket);
      } else {
        next.add(bucket);
      }
      return next;
    });
  };

  if (tasks.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("no_tasks")}</p>;
  }

  const buckets = {} as Record<TaskUrgencyBucket, MyTask[]>;
  for (const bucket of TASK_URGENCY_BUCKET_ORDER) buckets[bucket] = [];
  for (const task of tasks)
    buckets[getTaskUrgencyBucket(task.dueDate)].push(task);

  const nonEmptyBuckets = TASK_URGENCY_BUCKET_ORDER.filter(
    bucket => buckets[bucket].length > 0,
  );

  return (
    <div className="flex flex-col gap-4 min-w-0">
      {nonEmptyBuckets.map(bucket => {
        const bucketTasks = buckets[bucket];
        const isCollapsed = collapsed.has(bucket);

        return (
          <div key={bucket} className="flex flex-col gap-1 -ml-2 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleBucket(bucket)}
              className="h-auto w-fit justify-start gap-2 py-2"
            >
              <h3 className="text-xs font-semibold uppercase tracking-wide">
                {getTaskUrgencyBucketLabel(bucket, tRoot)}
              </h3>
              <span className="text-xs text-muted-foreground">
                {bucketTasks.length}
              </span>
              <ChevronDown
                className={cn(
                  "size-3.5 text-muted-foreground transition-transform",
                  isCollapsed && "-rotate-90",
                )}
              />
            </Button>

            {!isCollapsed && (
              <div className="flex flex-col divide-y border-l pl-2 ml-[0.95rem] min-w-0">
                {bucketTasks.map(task => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    members={members}
                    canEdit={canEdit}
                    canManage={canManage}
                    onUpdateTask={updateTaskField}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
