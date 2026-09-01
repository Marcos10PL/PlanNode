"use client";

import { ControlledSelectField } from "@/components/ui/controlled-select-field";
import { InfoPopover } from "@/components/ui/info-popover";

import { INVITABLE_ROLES } from "@/const";
import { WorkspaceRole } from "@/types/entities";
import { getRoleLabel } from "@/utils";

import { useTranslations } from "next-intl";
import { Control, FieldValues, Path } from "react-hook-form";

const ROLE_DESCRIPTION_KEYS: Record<Exclude<WorkspaceRole, "owner">, string> = {
  admin: "team.role_admin_description",
  member: "team.role_member_description",
  guest: "team.role_guest_description",
} as const;

type Props<TFieldValues extends FieldValues & { role: WorkspaceRole }> = {
  pending?: boolean;
  control: Control<TFieldValues>;
  noLabel?: boolean;
};

export function RoleSelect<
  TFieldValues extends FieldValues & { role: WorkspaceRole },
>({ pending, control, noLabel }: Props<TFieldValues>) {
  const t = useTranslations();

  const roleOptions = INVITABLE_ROLES.map(r => ({
    value: r,
    label: getRoleLabel(r, t),
  }));

  return (
    <div className="flex items-center gap-2">
      <ControlledSelectField
        control={control}
        name={"role" as Path<TFieldValues>}
        label={noLabel ? undefined : t("team.invite_role_label")}
        options={roleOptions}
        disabled={pending}
      />

      <InfoPopover
        label={t("team.role_info_label")}
        className="h-9 w-9 self-end"
      >
        <div className="flex flex-col gap-2">
          {roleOptions.map(({ value, label }) => (
            <div key={value}>
              <p className="text-xs font-medium pb-1">{label}</p>
              <p className="text-xs text-muted-foreground">
                {t(ROLE_DESCRIPTION_KEYS[value as never])}
              </p>
            </div>
          ))}
        </div>
      </InfoPopover>
    </div>
  );
}
