"use client";

import { updateMemberRoleAction } from "@/actions/workspace/update-member-role";
import { Button } from "@/components/ui/button";
import { ControlledSelectField } from "@/components/ui/controlled-select-field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { INVITABLE_ROLES } from "@/const";
import { getRoleLabel } from "@/utils";
import { updateMemberRoleSchema, UpdateMemberRoleSchema } from "@/schema";
import { WorkspaceMember } from "@/types/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  member: WorkspaceMember;
};

export function UpdateMemberRoleModal({ open, onOpenChange, workspaceId, member }: Props) {
  const t = useTranslations();

  const form = useForm<UpdateMemberRoleSchema>({
    resolver: zodResolver(updateMemberRoleSchema()),
    values: { role: member.role },
  });

  const roleOptions = INVITABLE_ROLES.map(r => ({
    value: r,
    label: getRoleLabel(r, t),
  }));

  const onSubmit = async (data: UpdateMemberRoleSchema) => {
    const result = await updateMemberRoleAction(workspaceId, member.id, data);
    if (result?.error) {
      toast.error(t("team.change_role_error"));
    } else {
      toast.success(t("team.change_role_success"));
      onOpenChange(false);
    }
  };

  const isPending = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("team.change_role")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <ControlledSelectField
            control={form.control}
            name="role"
            label={t("team.invite_role_label")}
            options={roleOptions}
            disabled={isPending}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t("workspace.edit.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {t("team.change_role_submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
