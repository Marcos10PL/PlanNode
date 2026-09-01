"use client";

import { deleteWorkspaceAction } from "@/actions/workspace/delete-workspace";
import { useWorkspaces } from "@/components/providers/workspace-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Workspace } from "@/types/dto"
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  workspace: Workspace;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteWorkspaceModal({ workspace, open, onOpenChange }: Props) {
  const [confirm, setConfirm] = useState("");
  const [isPending, setIsPending] = useState(false);

  const t = useTranslations("workspace.delete");
  const tCommon = useTranslations("common");
  const { activeWorkspace, setActiveWorkspace, workspaces } = useWorkspaces();

  const handleClose = () => onOpenChange(false);
  const resetState = () => setConfirm("");

  const handleDelete = async () => {
    setIsPending(true);
    try {
      const result = await deleteWorkspaceAction(workspace.id);

      if (result.error) {
        toast.error(t("error"));
        return;
      }

      toast.success(t("success"));

      if (activeWorkspace?.id === workspace.id) {
        const next = workspaces.find(w => w.id !== workspace.id) ?? null;
        if (next) setActiveWorkspace(next);
      }

      handleClose();
    } catch {
      toast.error(tCommon("unexpected_error"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={o => {
        if (!o) handleClose();
      }}
    >
      <DialogContent
        onAnimationEnd={() => {
          if (!open) resetState();
        }}
      >
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description", { name: workspace.name })}
          </DialogDescription>
        </DialogHeader>
        {workspace.memberCount > 1 && (
          <Alert
            description={t("other_members_warning", {
              count: workspace.memberCount - 1,
            })}
          />
        )}
        <div className="grid gap-3">
          <Label htmlFor="confirm-name">{t("confirm_label")}</Label>
          <Input
            id="confirm-name"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder={workspace.name}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={confirm !== workspace.name || isPending}
            onClick={handleDelete}
          >
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
