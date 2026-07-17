"use client";

import { createTaskListAction } from "@/actions/task/create-task-list";
import { updateTaskListAction } from "@/actions/task/update-task-list";
import { Button } from "@/components/ui/button";
import { ControlledInputField } from "@/components/ui/controlled-input-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VALIDATION_MAX } from "@/const";
import { createTaskListSchema, CreateTaskListSchema } from "@/schema";
import { TaskListWithTasks } from "@/types/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  projectId: string;
  list?: Pick<TaskListWithTasks, "id" | "name">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskListModal({ projectId, list, open, onOpenChange }: Props) {
  const t = useTranslations(list ? "tasks.list_rename" : "tasks.list_create");
  const tErrors = useTranslations("fields.errors");
  const tCommon = useTranslations("common");

  const form = useForm<CreateTaskListSchema>({
    resolver: zodResolver(createTaskListSchema(tErrors)),
    defaultValues: { name: list?.name ?? "" },
  });

  useEffect(() => {
    if (open) form.reset({ name: list?.name ?? "" });
  }, [open, list]);

  const isChanged = list ? form.watch("name") !== list.name : true;

  const onSubmit = async (data: CreateTaskListSchema) => {
    try {
      const result = list
        ? await updateTaskListAction(list.id, data)
        : await createTaskListAction(projectId, data);

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
            name="name"
            label={t("name_label")}
            placeholder={t("name_placeholder")}
            maxLength={VALIDATION_MAX.TASK_LIST_NAME}
          />
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
              disabled={form.formState.isSubmitting || !isChanged}
            >
              {form.formState.isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
