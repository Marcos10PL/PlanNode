"use client";

import { leaveWorkspaceAction } from "@/actions/workspace/leave-workspace";
import { useUser } from "@/components/providers/user-provider";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DeleteButton } from "@/components/ui/delete-button";
import { EditButton } from "@/components/ui/edit-button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { Workspace } from "@/types/dto";
import { Crown, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { DeleteWorkspaceModal } from "../delete-workspace-modal";
import { EditWorkspaceModal } from "../edit-workspace-modal";
import { TransferOwnershipModal } from "./transfer-ownership-modal";

export function WorkspaceActions({ workspace }: { workspace: Workspace }) {
  const t = useTranslations("profile_workspaces");
  const tTeam = useTranslations("team");
  const tCommon = useTranslations("common");
  const { user } = useUser();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const [isLeaving, startLeaveTransition] = useTransition();

  const isOwner = workspace.ownerId === user?.id;
  const canTransfer = isOwner && workspace.memberCount > 1;

  const handleLeave = () => {
    startLeaveTransition(async () => {
      try {
        const result = await leaveWorkspaceAction(workspace.id);
        if (result?.error) {
          toast.error(t("leave_error"));
        } else {
          toast.success(t("leave_success"));
          setLeaveOpen(false);
        }
      } catch {
        toast.error(tCommon("unexpected_error"));
      }
    });
  };

  return (
    <>
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {isOwner ? (
            <>
              <EditButton onClick={() => setEditOpen(true)} />
              {canTransfer && (
                <TooltipIconButton
                  icon={Crown}
                  label={tTeam("transfer_ownership")}
                  onClick={() => setTransferOpen(true)}
                />
              )}
              <DeleteButton onClick={() => setDeleteOpen(true)} />
            </>
          ) : (
            <TooltipIconButton
              icon={LogOut}
              label={t("leave")}
              onClick={() => setLeaveOpen(true)}
              disabled={isLeaving}
              className="text-destructive"
            />
          )}
        </div>
      </TooltipProvider>

      <EditWorkspaceModal
        workspace={workspace}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeleteWorkspaceModal
        workspace={workspace}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />

      <TransferOwnershipModal
        workspace={workspace}
        open={transferOpen}
        onOpenChange={setTransferOpen}
      />

      <ConfirmModal
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        onConfirm={handleLeave}
        title={t("workspace.leave_confirm_title")}
        description={t("workspace.leave_confirm_description")}
        isPending={isLeaving}
      />
    </>
  );
}
