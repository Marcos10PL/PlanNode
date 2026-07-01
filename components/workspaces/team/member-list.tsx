import { WorkspaceMember } from "@/types/dto";
import { WorkspaceRole } from "@/types/entities";
import { getTranslations } from "next-intl/server";
import { MemberRow } from "./elements/member-row";

type Props = {
  members: WorkspaceMember[];
  currentUserId: string;
  currentUserRole: WorkspaceRole;
  workspaceId: string;
};

export async function MemberList({
  members,
  currentUserId,
  currentUserRole,
  workspaceId,
}: Props) {
  const t = await getTranslations("team");

  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("no_members")}</p>;
  }

  return (
    <div className="flex flex-col divide-y-2 divide-accent/70 overflow-hidden">
      {members.map(member => (
        <MemberRow
          key={member.id}
          member={member}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          workspaceId={workspaceId}
        />
      ))}
    </div>
  );
}
