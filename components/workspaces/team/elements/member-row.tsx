"use client";

import { removeMemberAction } from "@/actions/workspace/remove-member";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserAvatar from "@/components/user-avatar";
import { MANAGER_ROLES, WORKSPACE_ROLES } from "@/const";

import { WorkspaceMember } from "@/types/dto";
import { WorkspaceRole } from "@/types/entities";
import { getRoleLabel, getRoleVariant } from "@/utils";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { UpdateMemberRoleModal } from "./update-member-role-modal";

type Props = {
  member: WorkspaceMember;
  currentUserId: string;
  currentUserRole: WorkspaceRole;
  workspaceId: string;
};

export function MemberRow({
  member,
  currentUserId,
  currentUserRole,
  workspaceId,
}: Props) {
  const t = useTranslations();
  const [changeRoleOpen, setChangeRoleOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const isSelf = member.id === currentUserId;
  const isOwner = member.role === WORKSPACE_ROLES.OWNER;
  const canManage =
    !isSelf && !isOwner && MANAGER_ROLES.includes(currentUserRole as never);

  const handleRemove = async () => {
    setIsPending(true);
    const result = await removeMemberAction(workspaceId, member.id);
    setIsPending(false);

    if (result?.error) {
      toast.error(t("team.remove_member_error"));
    } else {
      toast.success(t("team.remove_member_success"));
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 py-2">
        <UserAvatar name={member.fullName} />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-2">
            {member.fullName} {isSelf && `(${t("team.you")})`}
          </p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {member.email}
          </p>
        </div>

        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" disabled={isPending}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setChangeRoleOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                {t("team.change_role")}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setRemoveOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("team.remove_member")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Badge
          variant={getRoleVariant(member.role)}
          className="shrink-0 pointer-events-none"
        >
          {getRoleLabel(member.role, t)}
        </Badge>
      </div>

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
