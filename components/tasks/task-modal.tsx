"use client";

import { createTaskAction } from "@/actions/task/create-task";
import { updateTaskAction } from "@/actions/task/update-task";
import { Button } from "@/components/ui/button";
import { ControlledInputField } from "@/components/ui/controlled-input-field";
import { ControlledSelectField } from "@/components/ui/controlled-select-field";
import { ControlledTextareaField } from "@/components/ui/controlled-textarea-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  VALIDATION_MAX,
} from "@/const";
import { createTaskSchema, CreateTaskSchema } from "@/schema";
import { Task, WorkspaceMember } from "@/types/dto";
import { getPriorityLabel, getStatusLabel } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

const NO_ASSIGNEE = "none";

type Props = {
  listId: string;
  members: WorkspaceMember[];
  task?: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskModal({ listId, members, task, open, onOpenChange }: Props) {
  const t = useTranslations(task ? "tasks.edit" : "tasks.create");
  const tTasks = useTranslations();
  const tErrors = useTranslations("fields.errors");
  const tCommon = useTranslations("common");

  const defaultValues: CreateTaskSchema = {
    title: task?.title ?? "",
    description: task?.description ?? "",
    status: task?.status ?? TASK_STATUSES.TODO,
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
        toast.error(t("error"));
        return;
      }

      toast.success(t("success"));
      onOpenChange(false);
    } catch {
      toast.error(tCommon("unexpected_error"));
    }
  };

  const statusOptions = Object.values(TASK_STATUSES).map(s => ({
    value: s,
    label: getStatusLabel(s, tTasks),
  }));

  const priorityOptions = Object.values(TASK_PRIORITIES).map(p => ({
    value: p,
    label: getPriorityLabel(p, tTasks),
  }));

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
          <div className="grid grid-cols-2 gap-4">
            <ControlledSelectField
              control={form.control}
              name="status"
              label={t("status_label")}
              options={statusOptions}
            />
            <ControlledSelectField
              control={form.control}
              name="priority"
              label={t("priority_label")}
              options={priorityOptions}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Controller
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="assigneeId">
                    {t("assignee_label")}
                  </FieldLabel>
                  <Select
                    value={field.value ?? NO_ASSIGNEE}
                    onValueChange={v =>
                      field.onChange(v === NO_ASSIGNEE ? null : v)
                    }
                  >
                    <SelectTrigger id="assigneeId">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_ASSIGNEE}>
                        {tTasks("tasks.no_assignee")}
                      </SelectItem>
                      {members.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Input
                    id="dueDate"
                    type="date"
                    value={field.value ?? ""}
                    onChange={e => field.onChange(e.target.value || null)}
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
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
