"use client";

import { Button } from "@/components/ui/button";
import { ControlledInputField } from "@/components/ui/controlled-input-field";
import { ControlledTextareaField } from "@/components/ui/controlled-textarea-field";
import { DatePicker } from "@/components/ui/date-picker";
import { Field, FieldLabel } from "@/components/ui/field";
import { VALIDATION_MAX } from "@/const";
import { CreateTaskSchema } from "@/schema";
import { WorkspaceMember } from "@/types/dto";
import { useTranslations } from "next-intl";
import { Controller, UseFormReturn } from "react-hook-form";
import { AssigneePicker } from "./assignee-picker";
import { TaskPrioritySelect } from "./task-priority-select";
import { TaskStatusSelect } from "./task-status-select";

type Props = {
  form: UseFormReturn<CreateTaskSchema>;
  members: WorkspaceMember[];
  isEditing: boolean;
  onSubmit: (data: CreateTaskSchema) => void;
  onCancel: () => void;
};

export function TaskDetailsForm({
  form,
  members,
  isEditing,
  onSubmit,
  onCancel,
}: Props) {
  const t = useTranslations(isEditing ? "tasks.edit" : "tasks.create");

  return (
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
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button
          type="submit"
          disabled={
            form.formState.isSubmitting ||
            (isEditing && !form.formState.isDirty)
          }
        >
          {form.formState.isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
