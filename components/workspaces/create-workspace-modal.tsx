"use client";

import { createWorkspaceAction } from "@/actions/workspace/create-workspace";
import { useWorkspaces } from "@/components/providers/workspace-provider";
import { Button } from "@/components/ui/button";
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
import { ERRORS, VALIDATION_MAX } from "@/const";
import { createWorkspaceSchema, CreateWorkspaceSchema } from "@/schema";
import { Workspace } from "@/types/dto";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Step = "form" | "confirm-active";

export function CreateWorkspaceModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [created, setCreated] = useState<Workspace | null>(null);
  const t = useTranslations("workspace");
  const tProfile = useTranslations("profile_workspaces");
  const tErrors = useTranslations("fields.errors");
  const { workspaces, setActiveWorkspace } = useWorkspaces();

  const form = useForm<CreateWorkspaceSchema>({
    resolver: zodResolver(createWorkspaceSchema(tErrors)),
    defaultValues: { name: "", description: "" },
  });

  const handleClose = () => setOpen(false);

  const resetState = () => {
    setStep("form");
    setCreated(null);
    form.reset();
  };

  const onSubmit = async (data: CreateWorkspaceSchema) => {
    const result = await createWorkspaceAction(data);

    if (result.error) {
      toast.error(
        result.error === ERRORS.WORKSPACE_LIMIT_REACHED
          ? t("create.limit_reached")
          : t("create.error"),
      );
      return;
    }

    toast.success(t("create.success"));

    if (workspaces.length === 0) {
      setActiveWorkspace(result.workspace);
      handleClose();
    } else {
      setCreated(result.workspace);
      setStep("confirm-active");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={o => {
        if (!o) handleClose();
        else setOpen(true);
      }}
    >
      <DialogTrigger asChild>
        <Button>{tProfile("create_workspace")}</Button>
      </DialogTrigger>
      <DialogContent
        onAnimationEnd={() => {
          if (!open) resetState();
        }}
      >
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>{t("create.title")}</DialogTitle>
              <DialogDescription>{t("create.description")}</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <ControlledInputField
                control={form.control}
                name="name"
                label={t("create.name_label")}
                placeholder={t("create.name_placeholder")}
                maxLength={VALIDATION_MAX.WORKSPACE_NAME}
              />
              <ControlledTextareaField
                control={form.control}
                name="description"
                label={t("create.description_label")}
                placeholder={t("create.description_placeholder")}
                maxLength={VALIDATION_MAX.WORKSPACE_DESCRIPTION}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? t("create.submitting")
                  : t("create.submit")}
              </Button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{t("create.set_active_title")}</DialogTitle>
              <DialogDescription>
                {t("create.set_active_description", {
                  name: created?.name ?? "",
                })}
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleClose}>
                {t("create.set_active_no")}
              </Button>
              <Button
                onClick={() => {
                  if (created) setActiveWorkspace(created);
                  handleClose();
                }}
              >
                {t("create.set_active_yes")}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
