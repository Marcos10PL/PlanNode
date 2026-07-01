"use client";

import { WorkspaceInvitation } from "@/types/dto";
import { useTranslations } from "next-intl";
import { InvitationRow } from "./elements/invitation-row";

export function PendingInvitationsList({
  invitations,
}: {
  invitations: WorkspaceInvitation[];
}) {
  const t = useTranslations();

  if (invitations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("team.no_invitations")}
      </p>
    );
  }

  return (
    <div className="flex flex-col divide-y">
      {invitations.map(inv => (
        <InvitationRow key={inv.id} invitation={inv} />
      ))}
    </div>
  );
}
