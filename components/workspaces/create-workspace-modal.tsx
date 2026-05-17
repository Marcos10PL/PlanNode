"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ControlledInputField } from "@/components/ui/controlled-input-field";
import { ControlledTextareaField } from "@/components/ui/controlled-textarea-field";
import { createWorkspaceSchema, CreateWorkspaceSchema } from "@/schema";
import { createWorkspaceAction } from "@/actions/workspace/create-workspace";
import { VALIDATION_MAX } from "@/const";
import { useWorkspaces } from "@/components/providers/workspace-provider";
import { Workspace } from "@/types/entities";

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

  function handleClose() {
    setOpen(false);
    setStep("form");
    setCreated(null);
    form.reset();
  }

  async function onSubmit(data: CreateWorkspaceSchema) {
    const result = await createWorkspaceAction(data);

    if ("error" in result) {
      toast.error(t("create.error"));
      return;
    }

    toast.success(t("create.success"));

    if (workspaces.length === 0) {
      // setActiveWorkspace(result.workspace);
      handleClose();
    } else {
      setCreated(result.workspace);
      setStep("confirm-active");
    }
  }

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
      <DialogContent>
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
