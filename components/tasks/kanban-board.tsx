"use client";

import { Button } from "@/components/ui/button";
import { TASK_STATUS_ORDER } from "@/const";
import { Task } from "@/types/dto";
import { TaskStatus } from "@/types/entities";
import { TaskCoreProps } from "@/types/props";
import {
  cn,
  getStatusBgClass,
  getStatusBorderClass,
  getStatusDotClass,
  getStatusLabel,
} from "@/utils";
import { type DragEndEvent } from "@dnd-kit/react";
import { useTranslations } from "next-intl";
import { useLayoutEffect, useRef } from "react";
import { AddRowButton } from "./add-row-button";
import { SortableTaskCard } from "./sortable-task-card";

const BOTTOM_SPACING = 48;

export const KANBAN_COLUMN_WIDTH = 260;
export const KANBAN_COLLAPSED_WIDTH = 36;
export const KANBAN_GAP = 10;

type Props = TaskCoreProps & {
  tasksByStatus: Record<TaskStatus, Task[]>;
  collapsed: Set<TaskStatus>;
  onToggleCollapse: (status: TaskStatus) => void;
  dragEnabled: boolean;
  subtasksByParent: Map<string, Task[]>;
  onSubtaskDragEnd: (parentTaskId: string) => (event: DragEndEvent) => void;
  onAddTask: (status: TaskStatus) => void;
  onAddSubtask: (parentTaskId: string) => void;
};

export function KanbanBoard({
  tasksByStatus,
  collapsed,
  onToggleCollapse,
  members,
  canEdit,
  canManage,
  dragEnabled,
  onUpdateTask,
  subtasksByParent,
  onSubtaskDragEnd,
  onAddTask,
  onAddSubtask,
}: Props) {
  const t = useTranslations("tasks");
  const tRoot = useTranslations();
  const boardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const updateHeight = () => {
      if (!boardRef.current) return;

      const top = boardRef.current.getBoundingClientRect().top;
      const height = window.innerHeight - top - BOTTOM_SPACING;
      boardRef.current.style.setProperty(
        "--kanban-column-max-height",
        `${height}px`,
      );
    };
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(document.body);
    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  });

  return (
    <div ref={boardRef} className="overflow-x-auto pb-2">
      <div className="flex w-fit" style={{ gap: KANBAN_GAP }}>
        {TASK_STATUS_ORDER.map(status => {
          const tasks = tasksByStatus[status];
          const isCollapsed = collapsed.has(status);

          if (isCollapsed) {
            return (
              <div
                key={status}
                className="relative"
                style={{ width: KANBAN_COLLAPSED_WIDTH }}
              >
                <Button
                  variant="outline"
                  onClick={() => onToggleCollapse(status)}
                  style={{ height: "var(--kanban-column-max-height, auto)" }}
                  className={cn(
                    "h-auto w-full flex-col items-center justify-start gap-2 pt-3 pb-2 font-normal",
                    getStatusBgClass(status),
                    getStatusBorderClass(status),
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      getStatusDotClass(status),
                    )}
                  />
                  <span className="text-xs font-semibold uppercase tracking-wide [writing-mode:vertical-rl] rotate-180">
                    {getStatusLabel(status, tRoot)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {tasks.length}
                  </span>
                </Button>
              </div>
            );
          }

          return (
            <div
              key={status}
              style={{
                width: KANBAN_COLUMN_WIDTH,
                height: "var(--kanban-column-max-height, auto)",
              }}
              className={cn(
                "flex shrink-0 flex-col overflow-hidden rounded-lg border",
                getStatusBgClass(status),
                getStatusBorderClass(status),
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggleCollapse(status)}
                className="h-auto w-full shrink-0 justify-start gap-2 rounded-b-none py-2"
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    getStatusDotClass(status),
                  )}
                />
                <h3 className="text-xs font-semibold uppercase tracking-wide">
                  {getStatusLabel(status, tRoot)}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {tasks.length}
                </span>
              </Button>

              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
                {tasks.map((task, index) => (
                  <SortableTaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    members={members}
                    canEdit={canEdit}
                    canManage={canManage}
                    dragEnabled={dragEnabled}
                    onUpdateTask={onUpdateTask}
                    hiddenStatuses={collapsed}
                    subtasks={subtasksByParent.get(task.id) ?? []}
                    onSubtaskDragEnd={onSubtaskDragEnd(task.id)}
                    onAddSubtask={() => onAddSubtask(task.id)}
                  />
                ))}
                {canEdit && (
                  <div className="shrink-0">
                    <AddRowButton
                      label={t("add_task")}
                      onClick={() => onAddTask(status)}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
