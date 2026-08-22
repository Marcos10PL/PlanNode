"use client";

import { leaveWorkspaceAction } from "@/actions/workspace/leave-workspace";
import { useUser } from "@/components/providers/user-provider";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DeleteButton } from "@/components/ui/delete-button";
import { EditButton } from "@/components/ui/edit-button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { Workspace } from "@/types/dto";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteWorkspaceModal } from "../delete-workspace-modal";
import { EditWorkspaceModal } from "../edit-workspace-modal";

export function WorkspaceActions({ workspace }: { workspace: Workspace }) {
  const t = useTranslations("profile_workspaces");
  const tCommon = useTranslations("common");
  const { user } = useUser();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const [isLeaving, setIsLeaving] = useState(false);

  const isOwner = workspace.ownerId === user?.id;

  const handleLeave = async () => {
    setIsLeaving(true);
    try {
      const result = await leaveWorkspaceAction(workspace.id);
      if (result?.error) {
        toast.error(t("leave_error"));
      } else {
        toast.success(t("leave_success"));
      }
    } catch {
      toast.error(tCommon("unexpected_error"));
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <>
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {isOwner ? (
            <>
              <EditButton onClick={() => setEditOpen(true)} />
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
