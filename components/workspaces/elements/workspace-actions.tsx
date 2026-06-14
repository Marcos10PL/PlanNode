"use client";

import { leaveWorkspaceAction } from "@/actions/workspace/leave-workspace";
import { useUser } from "@/components/providers/user-provider";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Workspace } from "@/types/dto";
import { LogOut, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { DeleteWorkspaceModal } from "../delete-workspace-modal";
import { EditWorkspaceModal } from "../edit-workspace-modal";

export function WorkspaceActions({ workspace }: { workspace: Workspace }) {
  const t = useTranslations("profile_workspaces");
  const { user } = useUser();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const isOwner = workspace.ownerId === user?.id;

  const handleLeave = async () => {
    setIsLeaving(true);
    const result = await leaveWorkspaceAction(workspace.id);
    setIsLeaving(false);

    if (result?.error) {
      toast.error(t("leave_error"));
    } else {
      toast.success(t("leave_success"));
    }
  };

  return (
    <>
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {isOwner ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditOpen(true)}
                    className="text-info"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("edit")}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteOpen(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("delete")}</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLeave}
                  disabled={isLeaving}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t("leave")}</TooltipContent>
            </Tooltip>
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
    </>
  );
}
