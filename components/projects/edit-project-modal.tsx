"use client";

import { updateProjectAction } from "@/actions/project/update-project";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ControlledInputField } from "@/components/ui/controlled-input-field";
import { ControlledTextareaField } from "@/components/ui/controlled-textarea-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldLabel } from "@/components/ui/field";
import { VALIDATION_MAX } from "@/const";
import { updateProjectSchema, UpdateProjectSchema } from "@/schema";
import { Project } from "@/types/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditProjectModal({ project, open, onOpenChange }: Props) {
  const t = useTranslations("projects.edit");
  const tErrors = useTranslations("fields.errors");
  const tCommon = useTranslations("common");

  const form = useForm<UpdateProjectSchema>({
    resolver: zodResolver(updateProjectSchema(tErrors)),
    defaultValues: {
      name: project.name,
      description: project.description ?? "",
      isPrivate: project.isPrivate,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: project.name,
        description: project.description ?? "",
        isPrivate: project.isPrivate,
      });
    }
  }, [open, project]);

  const onSubmit = async (data: UpdateProjectSchema) => {
    try {
      const result = await updateProjectAction(project.id, data);

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

  const isChanged =
    form.watch("name") !== project.name ||
    form.watch("description") !== (project.description ?? "") ||
    form.watch("isPrivate") !== project.isPrivate;

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
            maxLength={VALIDATION_MAX.PROJECT_NAME}
          />
          <ControlledTextareaField
            control={form.control}
            name="description"
            label={t("description_label")}
            placeholder={t("description_placeholder")}
            maxLength={VALIDATION_MAX.PROJECT_DESCRIPTION}
          />
          <Controller
            control={form.control}
            name="isPrivate"
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="editIsPrivate"
                  checked={field.value}
                  onCheckedChange={v => field.onChange(v === true)}
                />
                <FieldLabel htmlFor="editIsPrivate">
                  {t("private_label")}
                </FieldLabel>
              </div>
            )}
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
