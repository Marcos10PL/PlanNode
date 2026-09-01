"use client";

import { removeMemberAction } from "@/actions/workspace/remove-member";
import { transferOwnershipAction } from "@/actions/workspace/transfer-ownership";
import { useUser } from "@/components/providers/user-provider";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ManageMenu } from "@/components/ui/manage-menu";
import { UserRow } from "@/components/ui/user-row";
import { ERRORS, MANAGER_ROLES, WORKSPACE_ROLES } from "@/const";

import { WorkspaceMember } from "@/types/dto";
import { WorkspaceRole } from "@/types/entities";
import { Crown, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { UpdateMemberRoleModal } from "./update-member-role-modal";

type Props = {
  member: WorkspaceMember;
  currentUserRole: WorkspaceRole;
  workspaceId: string;
};

export function MemberRow({ member, currentUserRole, workspaceId }: Props) {
  const t = useTranslations();
  const { user } = useUser();
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [isPending, startRemoveTransition] = useTransition();
  const [isTransferring, startTransferTransition] = useTransition();

  const isSelf = member.id === user.id;
  const isOwner = member.role === WORKSPACE_ROLES.OWNER;
  const canManage =
    !isSelf && !isOwner && MANAGER_ROLES.includes(currentUserRole);
  const canTransfer = !isSelf && currentUserRole === WORKSPACE_ROLES.OWNER;

  const handleRemove = () => {
    startRemoveTransition(async () => {
      try {
        const result = await removeMemberAction(workspaceId, member.id);
        if (result?.error) {
          toast.error(t("team.remove_member_error"));
        } else {
          toast.success(t("team.remove_member_success"));
          setRemoveOpen(false);
        }
      } catch {
        toast.error(t("common.unexpected_error"));
      }
    });
  };

  const handleTransfer = () => {
    startTransferTransition(async () => {
      try {
        const result = await transferOwnershipAction(workspaceId, member.id);
        if (result?.error === ERRORS.WORKSPACE_LIMIT_REACHED) {
          toast.error(t("team.transfer_ownership_limit_reached"));
        } else if (result?.error) {
          toast.error(t("team.transfer_ownership_error"));
        } else {
          toast.success(t("team.transfer_ownership_success"));
          setTransferOpen(false);
        }
      } catch {
        toast.error(t("common.unexpected_error"));
      }
    });
  };

  return (
    <>
      <UserRow
        userId={member.id}
        name={member.fullName}
        email={member.email}
        role={member.role}
        showBadge
      >
        {(canManage || canTransfer) && (
          <ManageMenu
            disabled={isPending || isTransferring}
            items={[
              ...(canManage
                ? [
                    {
                      label: t("team.change_role"),
                      icon: Pencil,
                      onClick: () => setChangeRoleOpen(true),
                    },
                    {
                      label: t("team.remove_member"),
                      icon: Trash2,
                      onClick: () => setRemoveOpen(true),
                      destructive: true,
                    },
                  ]
                : []),
              ...(canTransfer
                ? [
                    {
                      label: t("team.transfer_ownership"),
                      icon: Crown,
                      onClick: () => setTransferOpen(true),
                    },
                  ]
                : []),
            ]}
          />
        )}

      </UserRow>

      <UpdateMemberRoleModal
        open={changeRoleOpen}
        onOpenChange={setChangeRoleOpen}
        workspaceId={workspaceId}
        member={member}
      />

      <ConfirmModal
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        onConfirm={handleRemove}
        title={t("team.remove_member_confirm_title")}
        description={t("team.remove_member_confirm_description")}
        isPending={isPending}
        variant="destructive"
      />

      <ConfirmModal
        open={transferOpen}
        onOpenChange={setTransferOpen}
        onConfirm={handleTransfer}
        title={t("team.transfer_ownership_confirm_title")}
        description={t("team.transfer_ownership_confirm_description", {
          name: member.fullName,
        })}
        isPending={isTransferring}
        variant="destructive"
      />
    </>
  );
}
