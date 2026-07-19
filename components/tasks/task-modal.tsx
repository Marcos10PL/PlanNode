"use client";

import { createTaskAction } from "@/actions/task/create-task";
import { updateTaskAction } from "@/actions/task/update-task";
import { Button } from "@/components/ui/button";
import { ControlledInputField } from "@/components/ui/controlled-input-field";
import { ControlledTextareaField } from "@/components/ui/controlled-textarea-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  ERRORS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  VALIDATION_MAX,
} from "@/const";
import { createTaskSchema, CreateTaskSchema } from "@/schema";
import { Task, WorkspaceMember } from "@/types/dto";
import { TaskStatus } from "@/types/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { AssigneePicker } from "./assignee-picker";
import { TaskPrioritySelect } from "./task-priority-select";
import { TaskStatusSelect } from "./task-status-select";

type Props = {
  listId: string;
  members: WorkspaceMember[];
  task?: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedStatus?: TaskStatus;
};

export function TaskModal({
  listId,
  members,
  task,
  open,
  onOpenChange,
  selectedStatus,
}: Props) {
  const t = useTranslations(task ? "tasks.edit" : "tasks.create");
  const tErrors = useTranslations("fields.errors");
  const tCommon = useTranslations("common");
  const tTasks = useTranslations("tasks");

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
        : await createTaskAction(listId, data);

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

  return (
    <Dialog open={open} onOpenChange={o => !o && onOpenChange(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <ControlledInputField
            control={form.control}
            name="title"
            label={t("title_label")}
            placeholder={t("title_placeholder")}
            maxLength={VALIDATION_MAX.TASK_TITLE}
          />
          <ControlledTextareaField
            control={form.control}
            name="description"
            label={t("description_label")}
            placeholder={t("description_placeholder")}
            maxLength={VALIDATION_MAX.TASK_DESCRIPTION}
          />
          <div className="grid sm:grid-cols-2 gap-2">
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="status">{t("status_label")}</FieldLabel>
                  <TaskStatusSelect
                    id="status"
                    value={field.value}
                    onValueChange={field.onChange}
                    className="w-full"
                  />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="priority"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="priority">
                    {t("priority_label")}
                  </FieldLabel>
                  <TaskPrioritySelect
                    id="priority"
                    value={field.value}
                    onValueChange={field.onChange}
                    className="w-full"
                  />
                </Field>
              )}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            <Controller
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="assigneeId">
                    {t("assignee_label")}
                  </FieldLabel>
                  <AssigneePicker
                    id="assigneeId"
                    value={field.value}
                    onChange={field.onChange}
                    members={members}
                  />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="dueDate">
                    {t("due_date_label")}
                  </FieldLabel>
                  <DatePicker
                    id="dueDate"
                    value={field.value ?? null}
                    onChange={field.onChange}
                  />
                </Field>
              )}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={
                form.formState.isSubmitting ||
                (!!task && !form.formState.isDirty)
              }
            >
              {form.formState.isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
