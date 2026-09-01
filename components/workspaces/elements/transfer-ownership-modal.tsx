"use client";

import { getWorkspaceMembersAction } from "@/actions/workspace/get-workspace-members";
import { transferOwnershipAction } from "@/actions/workspace/transfer-ownership";
import { useUser } from "@/components/providers/user-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MemberSelectList } from "@/components/ui/member-select-list";
import { ERRORS } from "@/const";
import { Workspace, WorkspaceMember } from "@/types/dto";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  workspace: Workspace;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TransferOwnershipModal({
  workspace,
  open,
  onOpenChange,
}: Props) {
  const t = useTranslations("team");
  const tCommon = useTranslations("common");
  const { user } = useUser();
  const [members, setMembers] = useState<WorkspaceMember[] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (!open) return;
    getWorkspaceMembersAction(workspace.id)
      .then(result => setMembers(result.filter(m => m.id !== user.id)))
      .catch(() => {
        toast.error(tCommon("unexpected_error"));
        onOpenChange(false);
      });
  }, [open, workspace.id, user.id, tCommon, onOpenChange]);

  const resetState = () => {
    setSelected(null);
    setMembers(null);
  };

  const handleTransfer = async () => {
    if (!selected) return;
    setIsPending(true);
    try {
      const result = await transferOwnershipAction(workspace.id, selected);
      if (result?.error === ERRORS.WORKSPACE_LIMIT_REACHED) {
        toast.error(t("transfer_ownership_limit_reached"));
      } else if (result?.error) {
        toast.error(t("transfer_ownership_error"));
      } else {
        toast.success(t("transfer_ownership_success"));
        onOpenChange(false);
      }
    } catch {
      toast.error(tCommon("unexpected_error"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onOpenChange(false)}>
      <DialogContent
        onAnimationEnd={() => {
          if (!open) resetState();
        }}
      >
        <DialogHeader>
          <DialogTitle>{t("transfer_ownership")}</DialogTitle>
          <DialogDescription>
            {t("transfer_ownership_description", { name: workspace.name })}
          </DialogDescription>
        </DialogHeader>

        {members === null ? (
          <p className="text-sm text-muted-foreground">
            {t("transfer_ownership_loading")}
          </p>
        ) : members.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("transfer_ownership_no_other_members")}
          </p>
        ) : (
          <MemberSelectList
            members={members}
            selectedIds={selected ? [selected] : []}
            onSelect={id => setSelected(id === selected ? null : id)}
            disabled={isPending}
          />
        )}

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t("transfer_ownership_cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={!selected || isPending}
            onClick={handleTransfer}
          >
            {isPending
              ? t("transfer_ownership_submitting")
              : t("transfer_ownership_submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
