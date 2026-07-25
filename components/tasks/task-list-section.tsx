"use client";

import { reorderTasksAction } from "@/actions/task/reorder-tasks";
import { updateTaskAction } from "@/actions/task/update-task";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ManageMenu } from "@/components/ui/manage-menu";
import { TaskProgress } from "@/components/ui/task-progress";
import { ERRORS, TASK_SORTS, TASK_STATUSES } from "@/const";
import { useCookieState } from "@/hooks/use-cookie-state";
import { useDeleteTaskList } from "@/hooks/use-delete-task-list";
import { UpdateTaskSchema } from "@/schema";
import { Task, TaskListWithTasks, WorkspaceMember } from "@/types/dto";
import { TaskStatus } from "@/types/entities";
import {
  cn,
  getListManageMenuItems,
  getStatusBorderClass,
  getStatusDotClass,
  getStatusLabel,
} from "@/utils";
import {
  getTaskListCollapsedCookie,
  getTaskListSortCookie,
} from "@/utils/helpers";
import { move } from "@dnd-kit/helpers";
import {
  DragDropProvider,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { ChevronDown, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TaskListModal } from "./create-task-list-modal";
import { SortableTaskRow } from "./sortable-task-row";
import {
  DEFAULT_TASK_FILTERS,
  filterTasks,
  sortTasks,
  TaskFilters,
  TaskSort,
} from "./task-filters";
import { TaskModal } from "./task-modal";

const STATUS_GROUP_ORDER: TaskStatus[] = [
  TASK_STATUSES.TODO,
  TASK_STATUSES.IN_PROGRESS,
  TASK_STATUSES.IN_REVIEW,
  TASK_STATUSES.IN_TESTS,
  TASK_STATUSES.ON_HOLD,
  TASK_STATUSES.DONE,
  TASK_STATUSES.CANCELLED,
];

const toGroups = (tasks: Task[]): Record<TaskStatus, string[]> => {
  const groups = {} as Record<TaskStatus, string[]>;
  for (const status of STATUS_GROUP_ORDER) groups[status] = [];
  for (const task of tasks) groups[task.status].push(task.id);
  return groups;
};

type Props = {
  list: TaskListWithTasks;
  members: WorkspaceMember[];
  canEdit: boolean;
  defaultSort: TaskSort;
  defaultCollapsed: TaskStatus[];
};

export function TaskListSection({
  list,
  members,
  canEdit,
  defaultSort,
  defaultCollapsed,
}: Props) {
  const t = useTranslations("tasks");
  const tRoot = useTranslations();
  const router = useRouter();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedTaskStatus, setSelectedTaskStatus] = useState<TaskStatus>();
  const [filters, setFilters] = useState(DEFAULT_TASK_FILTERS);
  const [sort, setSort] = useCookieState(
    getTaskListSortCookie(list.id),
    defaultSort,
  );
  const [collapsedList, setCollapsedList] = useCookieState<TaskStatus[]>(
    getTaskListCollapsedCookie(list.id),
    defaultCollapsed,
  );
  const collapsed = new Set(collapsedList);

  const [tasks, setTasks] = useState<Task[]>(list.tasks);

  useEffect(() => {
    setTasks(list.tasks);
  }, [list.tasks]);

  const hasActiveFilters =
    filters.query.trim() !== "" ||
    filters.priorities.length > 0 ||
    filters.assigneeIds.length > 0 ||
    filters.unassigned;

  const dragEnabled =
    canEdit && sort === TASK_SORTS.DEFAULT && !hasActiveFilters;

  const handleDragOver = (event: DragOverEvent) => {
    const { source, target } = event.operation;
    if (!isSortable(source) || !isSortable(target)) return;
    if (source.sortable.group !== target.sortable.group) {
      event.preventDefault();
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled) return;

    const draggedId = event.operation.source?.id as string | undefined;
    if (!draggedId) return;

    const draggedTask = tasks.find(task => task.id === draggedId);
    if (!draggedTask) return;

    const beforeGroups = toGroups(tasks);
    const updatedGroups = move(beforeGroups, event);

    const newStatus = STATUS_GROUP_ORDER.find(status =>
      updatedGroups[status]?.includes(draggedId),
    );
    if (!newStatus || newStatus !== draggedTask.status) return;

    const taskById = new Map(tasks.map(task => [task.id, task]));
    const newTasksOrder = STATUS_GROUP_ORDER.flatMap(status =>
      (updatedGroups[status] ?? []).map(id => taskById.get(id)!),
    );

    const beforeOrder = STATUS_GROUP_ORDER.flatMap(
      status => beforeGroups[status] ?? [],
    );
    const oldPosition = new Map(beforeOrder.map((id, index) => [id, index]));

    const changes = newTasksOrder
      .map((task, position) => ({ id: task.id, position }))
      .filter(({ id, position }) => oldPosition.get(id) !== position);

    if (changes.length === 0) return;

    setTimeout(async () => {
      setTasks(newTasksOrder);

      try {
        const result = await reorderTasksAction(list.id, changes);
        if (result?.error) {
          setTasks(tasks);
          toast.error(
            result.error === ERRORS.INSUFFICIENT_ROLE
              ? tRoot("common.insufficient_role")
              : tRoot("common.unexpected_error"),
          );
          router.refresh();
        }
      } catch {
        setTasks(tasks);
        toast.error(tRoot("common.unexpected_error"));
        router.refresh();
      }
    }, 0);
  };

  const updateTaskField = async (
    taskId: string,
    patch: Partial<Task>,
    serverPatch: UpdateTaskSchema,
    fallbackErrorKey: string,
  ) => {
    const previous = tasks;
    setTasks(prev =>
      prev.map(task => (task.id === taskId ? { ...task, ...patch } : task)),
    );

    try {
      const result = await updateTaskAction(taskId, serverPatch);
      if (result?.error) {
        setTasks(previous);
        toast.error(
          result.error === ERRORS.INSUFFICIENT_ROLE
            ? tRoot("common.insufficient_role")
            : result.error === ERRORS.INVALID_ASSIGNEE
              ? tRoot("tasks.invalid_assignee")
              : tRoot(fallbackErrorKey),
        );
        router.refresh();
      }
      return result;
    } catch {
      setTasks(previous);
      toast.error(tRoot("common.unexpected_error"));
      router.refresh();
    }
  };

  const { remove, isPending } = useDeleteTaskList();
  const listManageMenuItems = getListManageMenuItems({
    canManage: canEdit,
    onRename: () => setRenameOpen(true),
    onDelete: () => setDeleteOpen(true),
    t,
  });

  const toggleGroup = (status: TaskStatus) => {
    const next = new Set(collapsedList);
    if (next.has(status)) {
      next.delete(status);
    } else {
      next.add(status);
    }
    setCollapsedList([...next]);
  };

  const visibleTasks = useMemo(
    () => sortTasks(filterTasks(tasks, filters), sort),
    [tasks, filters, sort],
  );

  const doneTasks = tasks.filter(
    task => task.status === TASK_STATUSES.DONE,
  ).length;
  const cancelledTasks = tasks.filter(
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
            {list.name} ({tasks.length})
          </h2>
          {canEdit && (
            <div className="self-end">
              <ManageMenu
                disabled={isPending}
                align="start"
                items={listManageMenuItems}
              />
            </div>
          )}
        </div>

        <section className="my-4">
          <TaskProgress
            total={tasks.length}
            done={doneTasks}
            cancelled={cancelledTasks}
            showLabel
          />
        </section>

        {tasks.length > 0 && (
          <div className="my-4">
            <TaskFilters
              members={members}
              filters={filters}
              onChange={setFilters}
              sort={sort}
              onSortChange={setSort}
            />
          </div>
        )}

        {tasks.length === 0 ? (
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
          <DragDropProvider
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col gap-4">
              {STATUS_GROUP_ORDER.map(status => {
                const tasks = visibleTasks.filter(
                  task => task.status === status,
                );
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
                        {tasks.map((task, index) => (
                          <SortableTaskRow
                            key={task.id}
                            task={task}
                            index={index}
                            members={members}
                            canEdit={canEdit}
                            dragEnabled={dragEnabled}
                            onUpdateTask={updateTaskField}
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
          </DragDropProvider>
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
