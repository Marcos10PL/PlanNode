"use client";

import { updateWorkspaceAction } from "@/actions/workspace/update-workspace";
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
import { VALIDATION_MAX } from "@/const";
import { updateWorkspaceSchema, UpdateWorkspaceSchema } from "@/schema";
import { Workspace } from "@/types/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  workspace: Workspace;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditWorkspaceModal({ workspace, open, onOpenChange }: Props) {
  const t = useTranslations("workspace.edit");
  const tErrors = useTranslations("fields.errors");

  const [isPending, setIsPending] = useState(false);

  const form = useForm<UpdateWorkspaceSchema>({
    resolver: zodResolver(updateWorkspaceSchema(tErrors)),
    defaultValues: {
      name: workspace.name,
      description: workspace.description ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: workspace.name,
        description: workspace.description ?? "",
      });
    }
  }, [open, workspace]);

  const onSubmit = async (data: UpdateWorkspaceSchema) => {
    setIsPending(true);
    const result = await updateWorkspaceAction(workspace.id, data);
    setIsPending(false);

    if (result.error) {
      toast.error(t("error"));
      return;
    }

    toast.success(t("success"));
    onOpenChange(false);
  };

  const isChanged =
    form.watch("name") !== workspace.name ||
    form.watch("description") !== (workspace.description ?? "");

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
            maxLength={VALIDATION_MAX.WORKSPACE_NAME}
          />
          <ControlledTextareaField
            control={form.control}
            name="description"
            label={t("description_label")}
            placeholder={t("description_placeholder")}
            maxLength={VALIDATION_MAX.WORKSPACE_DESCRIPTION}
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isPending || !isChanged}>
              {isPending ? t("submitting") : t("submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
