"use client";

import { updateMemberRoleAction } from "@/actions/workspace/update-member-role";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateMemberRoleSchema, UpdateMemberRoleSchema } from "@/schema";
import { WorkspaceMember } from "@/types/entities";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { RoleSelect } from "./role-select";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  member: WorkspaceMember;
};

export function UpdateMemberRoleModal({
  open,
  onOpenChange,
  workspaceId,
  member,
}: Props) {
  const t = useTranslations();

  const form = useForm<UpdateMemberRoleSchema>({
    resolver: zodResolver(updateMemberRoleSchema()),
    values: { role: member.role },
  });

  const onSubmit = async (data: UpdateMemberRoleSchema) => {
    const result = await updateMemberRoleAction(workspaceId, member.id, data);
    if (result?.error) {
      toast.error(t("team.change_role_error"));
    } else {
      toast.success(t("team.change_role_success"));
      onOpenChange(false);
    }
  };

  const isChange = form.watch("role") !== member.role;

  const isPending = form.formState.isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {t("team.change_role")}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <RoleSelect control={form.control} pending={isPending} noLabel />
          <div className="flex justify-end gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              {t("workspace.edit.cancel")}
            </Button>
            <Button type="submit" disabled={isPending || !isChange}>
              {isPending
                ? t("team.change_role_submitting")
                : t("team.change_role_submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
