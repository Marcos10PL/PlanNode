"use client";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ManageMenu } from "@/components/ui/manage-menu";
import { TaskProgress } from "@/components/ui/task-progress";
import { TASK_STATUSES } from "@/const";
import { useDeleteTaskList } from "@/hooks/use-delete-task-list";
import { TaskListWithTasks, WorkspaceMember } from "@/types/dto";
import { TaskStatus } from "@/types/entities";
import {
  cn,
  getStatusBorderClass,
  getStatusDotClass,
  getStatusLabel,
} from "@/utils";
import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { TaskListModal } from "./create-task-list-modal";
import {
  DEFAULT_TASK_FILTERS,
  filterTasks,
  sortTasks,
  TaskFilters,
} from "./task-filters";
import { TaskModal } from "./task-modal";
import { TaskRow } from "./task-row";

const STATUS_GROUP_ORDER: TaskStatus[] = [
  TASK_STATUSES.TODO,
  TASK_STATUSES.IN_PROGRESS,
  TASK_STATUSES.IN_REVIEW,
  TASK_STATUSES.IN_TESTS,
  TASK_STATUSES.ON_HOLD,
  TASK_STATUSES.DONE,
  TASK_STATUSES.CANCELLED,
];

type Props = {
  list: TaskListWithTasks;
  members: WorkspaceMember[];
  canEdit: boolean;
};

export function TaskListSection({ list, members, canEdit }: Props) {
  const t = useTranslations("tasks");
  const tRoot = useTranslations();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedTaskStatus, setSelectedTaskStatus] = useState<TaskStatus>();
  const [filters, setFilters] = useState(DEFAULT_TASK_FILTERS);
  const [collapsed, setCollapsed] = useState<Set<TaskStatus>>(new Set());

  const { remove, isPending } = useDeleteTaskList();

  const toggleGroup = (status: TaskStatus) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const visibleTasks = useMemo(
    () => sortTasks(filterTasks(list.tasks, filters), filters.sort),
    [list.tasks, filters],
  );

  const doneTasks = list.tasks.filter(
    task => task.status === TASK_STATUSES.DONE,
  ).length;
  const cancelledTasks = list.tasks.filter(
    task => task.status === TASK_STATUSES.CANCELLED,
  ).length;

  const handleDelete = async () => {
    await remove(list.id);
    setDeleteOpen(false);
  };

  return (
    <>
      <div className="flex flex-col mt-4">
        <div className="flex flex-col-reverse md:flex-row md:items-center gap-1">
          <h2 className="text-sm font-semibold min-w-0 break-all">
            {list.name} ({list.tasks.length})
          </h2>
          {canEdit && (
            <div className="self-end">
              <ManageMenu
                disabled={isPending}
                align="start"
                items={[
                  {
                    label: t("list_rename.trigger"),
                    icon: Pencil,
                    onClick: () => setRenameOpen(true),
                  },
                  {
                    label: t("list_delete.trigger"),
                    icon: Trash2,
                    onClick: () => setDeleteOpen(true),
                    destructive: true,
                  },
                ]}
              />
            </div>
          )}
        </div>

        <section className="my-4">
          <TaskProgress
            total={list.tasks.length}
            done={doneTasks}
            cancelled={cancelledTasks}
            showLabel
          />
        </section>

        {list.tasks.length > 0 && (
          <div className="my-4">
            <TaskFilters
              members={members}
              filters={filters}
              onChange={setFilters}
            />
          </div>
        )}

        {list.tasks.length === 0 ? (
          <>
            <p className="text-sm text-muted-foreground py-2">{t("empty")}</p>
            {canEdit && (
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground rounded-none hover:bg-accent/50 h-11 pl-2"
                onClick={() => setCreateTaskOpen(true)}
              >
                <Plus className="h-4 w-4" />
                {t("add_task")}
              </Button>
            )}
          </>
        ) : visibleTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            {t("filters.no_results")}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {STATUS_GROUP_ORDER.map(status => {
              const tasks = visibleTasks.filter(task => task.status === status);
              if (tasks.length === 0) return null;

              const isCollapsed = collapsed.has(status);

              return (
                <div key={status} className="flex flex-col gap-1 -ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleGroup(status)}
                    className="h-auto w-fit justify-start gap-2 py-2"
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${getStatusDotClass(status)}`}
                    />
                    <h3 className="text-xs font-semibold uppercase tracking-wide">
                      {getStatusLabel(status, tRoot)}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {tasks.length}
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-3.5 text-muted-foreground transition-transform",
                        isCollapsed && "-rotate-90",
                      )}
                    />
                  </Button>

                  {!isCollapsed && (
                    <div
                      className={cn(
                        "flex flex-col divide-y border-l pl-2 ml-[0.95rem]",
                        getStatusBorderClass(status),
                      )}
                    >
                      {tasks.map(task => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          members={members}
                          canEdit={canEdit}
                        />
                      ))}
                      {canEdit && (
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-muted-foreground rounded-none hover:bg-accent/50 h-11 pl-2"
                          onClick={() => {
                            setCreateTaskOpen(true);
                            setSelectedTaskStatus(status);
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          {t("add_task")}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TaskListModal
        projectId={list.projectId}
        list={list}
        open={renameOpen}
        onOpenChange={setRenameOpen}
      />

      <TaskModal
        listId={list.id}
        members={members}
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        selectedStatus={selectedTaskStatus}
      />

      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title={t("list_delete.confirm_title")}
        description={t("list_delete.confirm_description")}
        isPending={isPending}
        variant="destructive"
      />
    </>
  );
}
