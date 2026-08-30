"use client";

import { removeMemberAction } from "@/actions/workspace/remove-member";
import { useUser } from "@/components/providers/user-provider";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ManageMenu } from "@/components/ui/manage-menu";
import { UserRow } from "@/components/ui/user-row";
import { MANAGER_ROLES, WORKSPACE_ROLES } from "@/const";

import { WorkspaceMember } from "@/types/dto";
import { WorkspaceRole } from "@/types/entities";
import { Pencil, Trash2 } from "lucide-react";
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
  const [isPending, startRemoveTransition] = useTransition();

  const isSelf = member.id === user.id;
  const isOwner = member.role === WORKSPACE_ROLES.OWNER;
  const canManage =
    !isSelf && !isOwner && MANAGER_ROLES.includes(currentUserRole);

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

  return (
    <>
      <UserRow
        userId={member.id}
        name={member.fullName}
        email={member.email}
        role={member.role}
        showBadge
      >
        {canManage && (
          <ManageMenu
            disabled={isPending}
            items={[
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
    </>
  );
}
