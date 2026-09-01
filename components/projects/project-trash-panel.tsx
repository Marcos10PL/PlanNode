"use client";

import { getMoreTrashedTaskListsAction } from "@/actions/task/get-more-trashed-task-lists";
import { getMoreTrashedTasksAction } from "@/actions/task/get-more-trashed-tasks";
import { permanentlyClearProjectTrashAction } from "@/actions/task/permanently-clear-project-trash";
import { SubHeader } from "@/components/sub-header";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { SortSelect } from "@/components/ui/sort-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import {
  COOKIES,
  TRASH_PANEL_TABS,
  TRASH_SORTS,
  TrashPanelTab,
  TrashSort,
} from "@/const";
import { useCookieState } from "@/hooks/use-cookie-state";
import { usePermanentlyDeleteTask } from "@/hooks/use-permanently-delete-task";
import { usePermanentlyDeleteTaskList } from "@/hooks/use-permanently-delete-task-list";
import { useRestoreTask } from "@/hooks/use-restore-task";
import { useRestoreTaskList } from "@/hooks/use-restore-task-list";
import { TrashedTask, TrashedTaskList } from "@/types/dto";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TrashItemRow } from "./trash-item-row";

type Props = {
  projectId: string;
  title: React.ReactNode;
  initialLists: TrashedTaskList[];
  initialListsHasMore: boolean;
  initialListsSort: TrashSort;
  initialTasks: TrashedTask[];
  initialTasksHasMore: boolean;
  initialTasksSort: TrashSort;
  canEdit?: boolean;
  isWorkspaceManager?: boolean;
  currentUserId: string;
};

export function ProjectTrashPanel({
  projectId,
  title,
  initialLists,
  initialListsHasMore,
  initialListsSort,
  initialTasks,
  initialTasksHasMore,
  initialTasksSort,
  canEdit,
  isWorkspaceManager,
  currentUserId,
}: Props) {
  const t = useTranslations("tasks.trash");
  const tCommon = useTranslations("common");

  const [activeTab, setActiveTab] = useState<TrashPanelTab>(
    TRASH_PANEL_TABS.LISTS,
  );

  const [listsSort, setListsSort] = useCookieState<TrashSort>(
    COOKIES.LISTS_TRASH_SORT,
    initialListsSort,
  );
  const [lists, setLists] = useState(initialLists);
  const [listsHasMore, setListsHasMore] = useState(initialListsHasMore);
  const [prevInitialLists, setPrevInitialLists] = useState(initialLists);
  const [prevInitialListsHasMore, setPrevInitialListsHasMore] =
    useState(initialListsHasMore);
  const [isListsLoading, setIsListsLoading] = useState(false);
  const listsSentinelRef = useRef<HTMLDivElement>(null);
  const listsLoadingRef = useRef(false);

  const [tasksSort, setTasksSort] = useCookieState<TrashSort>(
    COOKIES.TASKS_TRASH_SORT,
    initialTasksSort,
  );
  const [tasks, setTasks] = useState(initialTasks);
  const [tasksHasMore, setTasksHasMore] = useState(initialTasksHasMore);
  const [prevInitialTasks, setPrevInitialTasks] = useState(initialTasks);
  const [prevInitialTasksHasMore, setPrevInitialTasksHasMore] =
    useState(initialTasksHasMore);
  const [isTasksLoading, setIsTasksLoading] = useState(false);
  const tasksSentinelRef = useRef<HTMLDivElement>(null);
  const tasksLoadingRef = useRef(false);

  if (
    initialLists !== prevInitialLists ||
    initialListsHasMore !== prevInitialListsHasMore
  ) {
    setPrevInitialLists(initialLists);
    setPrevInitialListsHasMore(initialListsHasMore);
    setLists(initialLists);
    setListsHasMore(initialListsHasMore);
  }

  if (
    initialTasks !== prevInitialTasks ||
    initialTasksHasMore !== prevInitialTasksHasMore
  ) {
    setPrevInitialTasks(initialTasks);
    setPrevInitialTasksHasMore(initialTasksHasMore);
    setTasks(initialTasks);
    setTasksHasMore(initialTasksHasMore);
  }

  const [deleteListTarget, setDeleteListTarget] =
    useState<TrashedTaskList | null>(null);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<TrashedTask | null>(
    null,
  );
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  const { restore: restoreList, isPending: isListRestorePending } =
    useRestoreTaskList();
  const { remove: removeListPermanently, isPending: isListDeletePending } =
    usePermanentlyDeleteTaskList();
  const { restore: restoreTask, isPending: isTaskRestorePending } =
    useRestoreTask();
  const { remove: removeTaskPermanently, isPending: isTaskDeletePending } =
    usePermanentlyDeleteTask();

  const canDeleteList = !!isWorkspaceManager;
  const canDeleteTask = (task: TrashedTask) =>
    !!isWorkspaceManager || task.createdBy === currentUserId;

  const handleListsSortChange = async (next: TrashSort) => {
    setListsSort(next);
    setIsListsLoading(true);
    try {
      const result = await getMoreTrashedTaskListsAction(projectId, next, 0);
      setLists(result.lists);
      setListsHasMore(result.hasMore);
    } finally {
      setIsListsLoading(false);
    }
  };

  const handleTasksSortChange = async (next: TrashSort) => {
    setTasksSort(next);
    setIsTasksLoading(true);
    try {
      const result = await getMoreTrashedTasksAction(projectId, next, 0);
      setTasks(result.tasks);
      setTasksHasMore(result.hasMore);
    } finally {
      setIsTasksLoading(false);
    }
  };

  useEffect(() => {
    if (!listsHasMore) return;
    const sentinel = listsSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || listsLoadingRef.current) return;

        listsLoadingRef.current = true;
        setIsListsLoading(true);
        try {
          const result = await getMoreTrashedTaskListsAction(
            projectId,
            listsSort,
            lists.length,
          );
          setLists(prev => [...prev, ...result.lists]);
          setListsHasMore(result.hasMore);
        } finally {
          listsLoadingRef.current = false;
          setIsListsLoading(false);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [listsHasMore, lists.length, listsSort, projectId]);

  useEffect(() => {
    if (!tasksHasMore) return;
    const sentinel = tasksSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || tasksLoadingRef.current) return;

        tasksLoadingRef.current = true;
        setIsTasksLoading(true);
        try {
          const result = await getMoreTrashedTasksAction(
            projectId,
            tasksSort,
            tasks.length,
          );
          setTasks(prev => [...prev, ...result.tasks]);
          setTasksHasMore(result.hasMore);
        } finally {
          tasksLoadingRef.current = false;
          setIsTasksLoading(false);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [tasksHasMore, tasks.length, tasksSort, projectId]);

  const handleRestoreList = async (list: TrashedTaskList) => {
    const ok = await restoreList(list.id);
    if (ok) setLists(prev => prev.filter(l => l.id !== list.id));
  };

  const handleRestoreTask = async (task: TrashedTask) => {
    const ok = await restoreTask(task.id);
    if (ok) setTasks(prev => prev.filter(t => t.id !== task.id));
  };

  const handleDeleteListConfirm = async () => {
    if (!deleteListTarget) return;
    const ok = await removeListPermanently(deleteListTarget.id);
    if (ok) setLists(prev => prev.filter(l => l.id !== deleteListTarget.id));
    setDeleteListTarget(null);
  };

  const handleDeleteTaskConfirm = async () => {
    if (!deleteTaskTarget) return;
    const ok = await removeTaskPermanently(deleteTaskTarget.id);
    if (ok) setTasks(prev => prev.filter(t => t.id !== deleteTaskTarget.id));
    setDeleteTaskTarget(null);
  };

  const handleClearAll = async () => {
    setIsClearingAll(true);
    try {
      const result = await permanentlyClearProjectTrashAction(projectId);
      if (result?.error) {
        toast.error(t("clear_all.error"));
      } else {
        toast.success(t("clear_all.success"));
      }
    } catch {
      toast.error(t("clear_all.error"));
    } finally {
      setIsClearingAll(false);
      setClearAllOpen(false);
    }
  };

  const isEmpty =
    lists.length === 0 && tasks.length === 0 && !listsHasMore && !tasksHasMore;

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center gap-2 mt-4 mb-6 justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <SubHeader title={title} className="my-1" />
          {isWorkspaceManager && (lists.length > 0 || tasks.length > 0) && (
            <TooltipIconButton
              icon={Trash2}
              label={t("clear_all.trigger")}
              onClick={() => setClearAllOpen(true)}
              className="text-destructive shrink-0"
            />
          )}
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto">
          {activeTab === TRASH_PANEL_TABS.LISTS && lists.length > 1 && (
            <SortSelect
              value={listsSort}
              onChange={handleListsSortChange}
              options={Object.values(TRASH_SORTS)}
              getLabel={s => t(`sort.${s}`)}
            />
          )}
          {activeTab === TRASH_PANEL_TABS.TASKS && tasks.length > 1 && (
            <SortSelect
              value={tasksSort}
              onChange={handleTasksSortChange}
              options={Object.values(TRASH_SORTS)}
              getLabel={s => t(`sort.${s}`)}
            />
          )}
        </div>
      </div>

      {isEmpty ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={v => setActiveTab(v as TrashPanelTab)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={TRASH_PANEL_TABS.LISTS}>
              {t("lists_heading")}
            </TabsTrigger>
            <TabsTrigger value={TRASH_PANEL_TABS.TASKS}>
              {t("tasks_heading")}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value={TRASH_PANEL_TABS.LISTS}
            forceMount
            className="mt-4 data-[state=inactive]:hidden"
          >
            {lists.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("no_lists")}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {lists.map(list => (
                  <TrashItemRow
                    key={list.id}
                    title={list.name}
                    deletedAt={list.deletedAt}
                    onRestore={() => handleRestoreList(list)}
                    isRestorePending={isListRestorePending}
                    canRestore={canEdit}
                    canDelete={canDeleteList}
                    onDelete={() => setDeleteListTarget(list)}
                    isDeletePending={isListDeletePending}
                  />
                ))}
                {listsHasMore && (
                  <div
                    ref={listsSentinelRef}
                    className="flex justify-center py-2"
                  >
                    {isListsLoading && (
                      <span className="text-xs text-muted-foreground">
                        {tCommon("loading_more")}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent
            value={TRASH_PANEL_TABS.TASKS}
            forceMount
            className="mt-4 data-[state=inactive]:hidden"
          >
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("no_tasks")}</p>
            ) : (
              <div className="flex flex-col gap-2">
                {tasks.map(task => (
                  <TrashItemRow
                    key={task.id}
                    title={task.title}
                    subtitle={
                      task.parentTitle &&
                      t("subtask_of", { title: task.parentTitle })
                    }
                    postfix={
                      task.listName && t("in_list", { name: task.listName })
                    }
                    deletedAt={task.deletedAt}
                    onRestore={() => handleRestoreTask(task)}
                    isRestorePending={isTaskRestorePending}
                    canRestore={canEdit}
                    canDelete={canDeleteTask(task)}
                    onDelete={() => setDeleteTaskTarget(task)}
                    isDeletePending={isTaskDeletePending}
                  />
                ))}
                {tasksHasMore && (
                  <div
                    ref={tasksSentinelRef}
                    className="flex justify-center py-2"
                  >
                    {isTasksLoading && (
                      <span className="text-xs text-muted-foreground">
                        {tCommon("loading_more")}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <ConfirmModal
        open={!!deleteListTarget}
        onOpenChange={o => !o && setDeleteListTarget(null)}
        onConfirm={handleDeleteListConfirm}
        title={t("delete_permanently.confirm_title")}
        description={t("delete_permanently.confirm_description")}
        isPending={isListDeletePending}
        variant="destructive"
      />

      <ConfirmModal
        open={!!deleteTaskTarget}
        onOpenChange={o => !o && setDeleteTaskTarget(null)}
        onConfirm={handleDeleteTaskConfirm}
        title={t("delete_permanently.confirm_title")}
        description={t("delete_permanently.confirm_description")}
        isPending={isTaskDeletePending}
        variant="destructive"
      />

      <ConfirmModal
        open={clearAllOpen}
        onOpenChange={setClearAllOpen}
        onConfirm={handleClearAll}
        title={t("clear_all.confirm_title")}
        description={t("clear_all.confirm_description")}
        isPending={isClearingAll}
        variant="destructive"
      />
    </>
  );
}
