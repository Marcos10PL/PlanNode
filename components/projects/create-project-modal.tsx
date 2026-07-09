"use client";

import { createProjectAction } from "@/actions/project/create-project";
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
import { VALIDATION_MAX } from "@/const";
import { createProjectSchema, CreateProjectSchema } from "@/schema";
import { generateProjectRoute } from "@/utils/helpers";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  workspaceId: string;
};

export function CreateProjectModal({ workspaceId }: Props) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("projects.create");
  const tErrors = useTranslations("fields.errors");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const form = useForm<CreateProjectSchema>({
    resolver: zodResolver(createProjectSchema(tErrors)),
    defaultValues: { name: "", description: "", isPrivate: false },
  });

  const onSubmit = async (data: CreateProjectSchema) => {
    try {
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

  return (
    <Dialog
      open={open}
      onOpenChange={o => {
        setOpen(o);
        if (!o) form.reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>{t("trigger")}</Button>
      </DialogTrigger>
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
                  id="isPrivate"
                  checked={field.value}
                  onCheckedChange={v => field.onChange(v === true)}
                />
                <FieldLabel htmlFor="isPrivate">
                  {t("private_label")}
                </FieldLabel>
              </div>
            )}
          />
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? t("submitting") : t("submit")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
