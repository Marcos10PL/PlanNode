"use client";

import { createProjectAction } from "@/actions/project/create-project";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldLabel } from "@/components/ui/field";
import { PROJECT_COLORS, PROJECT_ICONS, VALIDATION_MAX } from "@/const";
import { createProjectSchema, CreateProjectSchema } from "@/schema";
import { Project } from "@/types/dto";
import { toProjectColor, toProjectIcon } from "@/utils";
import { generateProjectRoute } from "@/utils/helpers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ProjectAppearancePicker } from "./project-appearance-picker";

type Props = {
  workspaceId: string;
  project?: Project;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ProjectModal({
  workspaceId,
  project,
  trigger,
  open,
  onOpenChange,
}: Props) {
  const t = useTranslations(project ? "projects.edit" : "projects.create");
  const tErrors = useTranslations("fields.errors");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setOpen = isControlled ? (onOpenChange ?? (() => {})) : setInternalOpen;

  const defaultValues = (): CreateProjectSchema => ({
    name: project?.name ?? "",
    description: project?.description ?? "",
    isPrivate: project?.isPrivate ?? false,
    icon: toProjectIcon(project?.icon ?? PROJECT_ICONS.FOLDER_KANBAN),
    color: toProjectColor(project?.color ?? PROJECT_COLORS.NEUTRAL),
  });

  const form = useForm<CreateProjectSchema>({
    resolver: zodResolver(createProjectSchema(tErrors)),
    defaultValues: defaultValues(),
  });

  useEffect(() => {
    if (isOpen) form.reset(defaultValues());
  }, [isOpen, project]);

  const onSubmit = async (data: CreateProjectSchema) => {
    try {
      if (project) {
        const result = await updateProjectAction(project.id, data);

        if (result.error) {
          toast.error(t("error"));
          return;
        }

        toast.success(t("success"));
        setOpen(false);
        return;
      }

      const result = await createProjectAction(workspaceId, data);

      if (result.error) {
        toast.error(t("error"));
        return;
      }

      toast.success(t("success"));
      setOpen(false);
      router.push(generateProjectRoute(result.projectId!));
    } catch {
      toast.error(tCommon("unexpected_error"));
    }
  };

  const isChanged = project
    ? form.watch("name") !== project.name ||
      form.watch("description") !== (project.description ?? "") ||
      form.watch("isPrivate") !== project.isPrivate ||
      form.watch("icon") !== project.icon ||
      form.watch("color") !== project.color
    : true;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger ?? <Button>{t("trigger")}</Button>}
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <ProjectAppearancePicker control={form.control} />
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
                  id={project ? "editIsPrivate" : "isPrivate"}
                  checked={field.value}
                  onCheckedChange={v => field.onChange(v === true)}
                />
                <FieldLabel htmlFor={project ? "editIsPrivate" : "isPrivate"}>
                  {t("private_label")}
                </FieldLabel>
              </div>
            )}
          />
          <div className="flex gap-2 justify-end">
            {project && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                {t("cancel")}
              </Button>
            )}
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
