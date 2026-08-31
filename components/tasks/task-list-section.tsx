"use client";

import { reorderTasksAction } from "@/actions/task/reorder-tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ManageMenu } from "@/components/ui/manage-menu";
import {
  ERRORS,
  KANBAN_COLUMN_WIDTH,
  KANBAN_GAP,
  TASK_SORTS,
  TASK_STATUS_ORDER,
  TASK_STATUSES,
  TASK_VIEWS,
  TaskView,
} from "@/const";
import { useCookieState } from "@/hooks/use-cookie-state";
import { useDeleteTaskList } from "@/hooks/use-delete-task-list";
import { useOptimisticTaskUpdate } from "@/hooks/use-optimistic-task-update";
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
  getTaskListViewCookie,
} from "@/utils/helpers";
import { move } from "@dnd-kit/helpers";
import {
  DragDropProvider,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/react";
import { isSortable } from "@dnd-kit/react/sortable";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AddRowButton } from "./add-row-button";
import { TaskListModal } from "./create-task-list-modal";
import { KanbanBoard } from "./kanban-board";
import { SortableTaskRow } from "./sortable-task-row";
import {
  DEFAULT_TASK_FILTERS,
  filterTasks,
  sortTasks,
  TaskFilters,
  TaskSort,
} from "./task-filters";
import { TaskModal } from "./task-modal";

const toGroups = (tasks: Task[]): Record<TaskStatus, string[]> => {
  const groups = {} as Record<TaskStatus, string[]>;
  for (const status of TASK_STATUS_ORDER) groups[status] = [];
  for (const task of tasks) groups[task.status].push(task.id);
  return groups;
};

type Props = {
  list: TaskListWithTasks;
  members: WorkspaceMember[];
  canEdit: boolean;
  canManage: boolean;
  defaultSort: TaskSort;
  defaultCollapsed: TaskStatus[];
  defaultView: TaskView;
};

export function TaskListSection({
  list,
  members,
  canEdit,
  canManage,
  defaultSort,
  defaultCollapsed,
  defaultView,
}: Props) {
  const t = useTranslations("tasks");
  const tRoot = useTranslations();
  const router = useRouter();
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [selectedTaskStatus, setSelectedTaskStatus] = useState<TaskStatus>();
  const [createSubtaskParentId, setCreateSubtaskParentId] = useState<string>();
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
  const [view, setView] = useCookieState(
    getTaskListViewCookie(list.id),
    defaultView,
  );

  const [tasks, setTasks] = useState<Task[]>(list.tasks);

  useEffect(() => {
    setTasks(list.tasks);
  }, [list.tasks]);

  const topLevelTasks = useMemo(
    () => tasks.filter(task => !task.parentTaskId),
    [tasks],
  );

  const subtasksByParent = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const task of tasks) {
      if (!task.parentTaskId) continue;
      const siblings = map.get(task.parentTaskId) ?? [];
      siblings.push(task);
      map.set(task.parentTaskId, siblings);
    }
    for (const siblings of map.values()) {
      siblings.sort((a, b) => a.position - b.position);
    }
    return map;
  }, [tasks]);

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

    const draggedTask = topLevelTasks.find(task => task.id === draggedId);
    if (!draggedTask) return;

    const beforeGroups = toGroups(topLevelTasks);
    const updatedGroups = move(beforeGroups, event);

    const newStatus = TASK_STATUS_ORDER.find(status =>
      updatedGroups[status]?.includes(draggedId),
    );
    if (!newStatus || newStatus !== draggedTask.status) return;

    const taskById = new Map(topLevelTasks.map(task => [task.id, task]));
    const newTopLevelOrder = TASK_STATUS_ORDER.flatMap(status =>
      (updatedGroups[status] ?? []).map(id => taskById.get(id)!),
    );

    const beforeOrder = TASK_STATUS_ORDER.flatMap(
      status => beforeGroups[status] ?? [],
    );
    const oldPosition = new Map(beforeOrder.map((id, index) => [id, index]));

    const changes = newTopLevelOrder
      .map((task, position) => ({ id: task.id, position }))
      .filter(({ id, position }) => oldPosition.get(id) !== position);

    if (changes.length === 0) return;

    const previousTasks = tasks;

    setTimeout(async () => {
      const positionById = new Map(changes.map(c => [c.id, c.position]));
      setTasks(prev =>
        prev.map(task =>
          positionById.has(task.id)
            ? { ...task, position: positionById.get(task.id)! }
            : task,
        ),
      );

      try {
        const result = await reorderTasksAction(list.id, changes);
        if (result?.error) {
          setTasks(previousTasks);
          toast.error(
            result.error === ERRORS.INSUFFICIENT_ROLE
              ? tRoot("common.insufficient_role")
              : tRoot("common.unexpected_error"),
          );
          router.refresh();
        }
      } catch {
        setTasks(previousTasks);
        toast.error(tRoot("common.unexpected_error"));
        router.refresh();
      }
    }, 0);
  };

  const handleSubtaskDragEnd =
    (parentTaskId: string) => (event: DragEndEvent) => {
      if (event.canceled) return;

      const draggedId = event.operation.source?.id;
      if (!draggedId) return;

      const siblings = subtasksByParent.get(parentTaskId) ?? [];
      const ids = siblings.map(task => task.id);
      const movedIds = move(ids, event);

      const oldPosition = new Map(ids.map((id, index) => [id, index]));
      const changes = movedIds
        .map((id, position) => ({ id, position }))
        .filter(({ id, position }) => oldPosition.get(id) !== position);

      if (changes.length === 0) return;

      const previousTasks = tasks;

      setTimeout(async () => {
        const positionById = new Map(changes.map(c => [c.id, c.position]));
        setTasks(prev =>
          prev.map(task =>
            positionById.has(task.id)
              ? { ...task, position: positionById.get(task.id)! }
              : task,
          ),
        );

        try {
          const result = await reorderTasksAction(list.id, changes);
          if (result?.error) {
            setTasks(previousTasks);
            toast.error(tRoot("common.unexpected_error"));
            router.refresh();
          }
        } catch {
          setTasks(previousTasks);
          toast.error(tRoot("common.unexpected_error"));
          router.refresh();
        }
      }, 0);
    };

  const updateTaskField = useOptimisticTaskUpdate(tasks, setTasks);

  const { remove, isPending } = useDeleteTaskList();
  const listManageMenuItems = getListManageMenuItems({
    canEdit,
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
    () => sortTasks(filterTasks(topLevelTasks, filters), sort),
    [topLevelTasks, filters, sort],
  );

  const visibleTasksByStatus = useMemo(() => {
    const groups = {} as Record<TaskStatus, Task[]>;
    for (const status of TASK_STATUS_ORDER) groups[status] = [];
    for (const task of visibleTasks) groups[task.status].push(task);
    return groups;
  }, [visibleTasks]);

  const boardWidth =
    TASK_STATUS_ORDER.length * KANBAN_COLUMN_WIDTH +
    (TASK_STATUS_ORDER.length - 1) * KANBAN_GAP;

  const doneTasks = topLevelTasks.filter(
    task => task.status === TASK_STATUSES.DONE,
  ).length;
  const cancelledTasks = topLevelTasks.filter(
    task => task.status === TASK_STATUSES.CANCELLED,
  ).length;

  const handleDelete = async () => {
    await remove(list.id);
    setDeleteOpen(false);
  };

  const openCreateTask = (status?: TaskStatus) => {
    setSelectedTaskStatus(status);
    setCreateSubtaskParentId(undefined);
    setCreateTaskOpen(true);
  };

  const openCreateSubtask = (parentTaskId: string) => {
    setCreateSubtaskParentId(parentTaskId);
    setSelectedTaskStatus(undefined);
    setCreateTaskOpen(true);
  };

  return (
    <>
      <div className="flex flex-col mt-4 w-[100cqw] mx-[calc(50%-50cqw)] px-4 md:px-6">
        <div
          className="flex flex-col mx-auto"
          style={{ width: `min(100%, ${boardWidth}px)` }}
        >
          <div className="flex flex-col-reverse md:flex-row md:items-center gap-1">
            <div className="flex min-w-0 items-center gap-2">
              <h2 className="text-sm font-semibold min-w-0 break-all">
                {list.name}
              </h2>
              <Badge variant="secondary" className="shrink-0">
                {doneTasks}/{topLevelTasks.length - cancelledTasks}
              </Badge>
            </div>
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

          <div className="my-4">
            <TaskFilters
              members={members}
              filters={filters}
              onChange={setFilters}
              sort={sort}
              onSortChange={setSort}
              view={view}
              onViewChange={setView}
            />
          </div>

          {view === TASK_VIEWS.KANBAN ? (
            <DragDropProvider
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <KanbanBoard
                tasksByStatus={visibleTasksByStatus}
                collapsed={collapsed}
                onToggleCollapse={toggleGroup}
                members={members}
                canEdit={canEdit}
                canManage={canManage}
                dragEnabled={dragEnabled}
                onUpdateTask={updateTaskField}
                subtasksByParent={subtasksByParent}
                onSubtaskDragEnd={handleSubtaskDragEnd}
                onAddTask={openCreateTask}
                onAddSubtask={openCreateSubtask}
              />
            </DragDropProvider>
          ) : (
            <DragDropProvider
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="flex flex-col gap-4">
                {TASK_STATUS_ORDER.map(status => {
                  const tasks = visibleTasksByStatus[status];
                  const isCollapsed = collapsed.has(status);

                  return (
                    <div key={status} className="flex flex-col gap-1 -ml-2">
                      <div className="flex items-center">
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
                      </div>

                      {!isCollapsed && (
                        <div
                          className={cn(
                            "flex flex-col divide-y border-l pl-2 ml-[0.95rem]",
                            getStatusBorderClass(status),
                          )}
                        >
                          {tasks.length === 0 && !canEdit ? (
                            <p className="text-sm text-muted-foreground py-2 pl-3">
                              {t("no_tasks_for_status")}
                            </p>
                          ) : (
                            <>
                              {tasks.map((task, index) => (
                                <SortableTaskRow
                                  key={task.id}
                                  task={task}
                                  index={index}
                                  members={members}
                                  canEdit={canEdit}
                                  canManage={canManage}
                                  dragEnabled={dragEnabled}
                                  onUpdateTask={updateTaskField}
                                  hiddenStatuses={collapsed}
                                  subtasks={subtasksByParent.get(task.id) ?? []}
                                  onSubtaskDragEnd={handleSubtaskDragEnd(
                                    task.id,
                                  )}
                                  onAddSubtask={() =>
                                    openCreateSubtask(task.id)
                                  }
                                />
                              ))}
                              {canEdit && (
                                <AddRowButton
                                  label={t("add_task")}
                                  onClick={() => openCreateTask(status)}
                                />
                              )}
                            </>
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
        canEdit={canEdit}
        canManage={canManage}
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        selectedStatus={selectedTaskStatus}
        parentTaskId={createSubtaskParentId}
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
