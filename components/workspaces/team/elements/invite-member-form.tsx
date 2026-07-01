"use client";

import { inviteMemberAction } from "@/actions/workspace/invite-member";
import { Button } from "@/components/ui/button";
import { ControlledInputField } from "@/components/ui/controlled-input-field";
import { ERRORS, WORKSPACE_ROLES } from "@/const";
import { inviteMemberSchema, InviteMemberSchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { RoleSelect } from "./role-select";

export function InviteMemberForm({ workspaceId }: { workspaceId: string }) {
  const t = useTranslations();
  const tErrors = useTranslations("fields.errors");

  const form = useForm<InviteMemberSchema>({
    resolver: zodResolver(inviteMemberSchema(tErrors)),
    defaultValues: { email: "", role: WORKSPACE_ROLES.MEMBER },
  });

  const onSubmit = async (data: InviteMemberSchema) => {
    try {
      const result = await inviteMemberAction(workspaceId, data);
      if (result?.error === ERRORS.ALREADY_MEMBER) {
        toast.error(t("team.invite_already_member"));
      } else if (result?.error) {
        toast.error(t("team.invite_error"));
      } else {
        toast.success(t("team.invite_success"));
        form.reset();
      }
    } catch {
      toast.error(t("common.unexpected_error"));
    }
  };

  const isPending = form.formState.isSubmitting;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-2 border rounded-md p-4"
    >
      <div className="flex-1">
        <ControlledInputField
          control={form.control}
          name="email"
          type="email"
          label={t("team.invite_email_label")}
          placeholder={t("team.invite_email_placeholder")}
          disabled={isPending}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mt-2 items-end">
        <div className="flex-1 min-w-full sm:min-w-0">
          <RoleSelect control={form.control} pending={isPending} />
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="min-w-full sm:min-w-1/4"
        >
          {isPending ? t("team.invite_submitting") : t("team.invite_submit")}
        </Button>
      </div>
    </form>
  );
}
