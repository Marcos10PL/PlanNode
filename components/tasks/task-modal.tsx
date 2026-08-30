"use client";

import { createTaskAction } from "@/actions/task/create-task";
import { updateTaskAction } from "@/actions/task/update-task";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ERRORS,
  TASK_MODAL_TABS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  TaskModalTab,
} from "@/const";
import { useTaskTimeline } from "@/hooks/use-task-timeline";
import { createTaskSchema, CreateTaskSchema } from "@/schema";
import { Task, WorkspaceMember } from "@/types/dto";
import { TaskStatus } from "@/types/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { TaskActivityList } from "./task-activity-list";
import { TaskDetailsForm } from "./task-details-form";

type Props = {
  listId: string;
  members: WorkspaceMember[];
  task?: Task;
  canEdit: boolean;
  canManage: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStatus?: TaskStatus;
  parentTaskId?: string;
  activeTab?: TaskModalTab;
  onTabChange?: (tab: TaskModalTab) => void;
};

export function TaskModal({
  listId,
  members,
  task,
  canEdit,
  canManage,
  open,
  onOpenChange,
  selectedStatus,
  parentTaskId,
  activeTab = TASK_MODAL_TABS.DETAILS,
  onTabChange,
}: Props) {
  const t = useTranslations(task ? "tasks.edit" : "tasks.create");
  const tErrors = useTranslations("fields.errors");
  const tCommon = useTranslations("common");
  const tTasks = useTranslations("tasks");

  const {
    items: timeline,
    isLoading: timelineLoading,
    refetch: loadTimeline,
  } = useTaskTimeline(task?.id, open);

  const defaultValues: CreateTaskSchema = {
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: selectedStatus ?? task?.status ?? TASK_STATUSES.TODO,
    priority: task?.priority ?? TASK_PRIORITIES.MEDIUM,
    assigneeId: task?.assigneeId ?? null,
    dueDate: task?.dueDate ?? null,
  };

  const form = useForm<CreateTaskSchema>({
    resolver: zodResolver(createTaskSchema(tErrors)),
    defaultValues,
  });

  useEffect(() => {
    if (open) form.reset(defaultValues);
  }, [open, task]);

  const onSubmit = async (data: CreateTaskSchema) => {
    try {
      const result = task
        ? await updateTaskAction(task.id, data)
        : await createTaskAction(listId, data, parentTaskId);

      if (result.error) {
        toast.error(
          result.error === ERRORS.INSUFFICIENT_ROLE
            ? tCommon("insufficient_role")
            : result.error === ERRORS.INVALID_ASSIGNEE
              ? tTasks("invalid_assignee")
              : t("error"),
        );
        return;
      }

      toast.success(t("success"));
      onOpenChange(false);
    } catch {
      toast.error(tCommon("unexpected_error"));
    }
  };

  const detailsForm = (
    <TaskDetailsForm
      form={form}
      members={members}
      isEditing={!!task}
      canEdit={canEdit}
      onSubmit={onSubmit}
      onCancel={() => onOpenChange(false)}
    />
  );

  return (
    <Dialog open={open} onOpenChange={o => !o && onOpenChange(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {task && !canEdit ? t("title_readonly") : t("title")}
          </DialogTitle>
          {!task && <DialogDescription>{t("description")}</DialogDescription>}
        </DialogHeader>

        {task ? (
          <Tabs
            value={activeTab}
            onValueChange={v => onTabChange?.(v as TaskModalTab)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">{t("tab_details")}</TabsTrigger>
              <TabsTrigger value="activity">{t("tab_activity")}</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-4">
              {detailsForm}
            </TabsContent>
            <TabsContent value="activity" className="mt-4">
              <TaskActivityList
                taskId={task.id}
                items={timeline}
                isLoading={timelineLoading}
                canComment={canEdit}
                canManageComments={canManage}
                onChanged={loadTimeline}
              />
            </TabsContent>
          </Tabs>
        ) : (
          detailsForm
        )}
      </DialogContent>
    </Dialog>
  );
}
