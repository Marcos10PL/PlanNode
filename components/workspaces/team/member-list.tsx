"use client";

import { Input } from "@/components/ui/input";
import { WorkspaceMember } from "@/types/dto";
import { WorkspaceRole } from "@/types/entities";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { MemberRow } from "./elements/member-row";

type Props = {
  members: WorkspaceMember[];
  currentUserRole: WorkspaceRole;
  workspaceId: string;
};

export function MemberList({ members, currentUserRole, workspaceId }: Props) {
  const t = useTranslations("team");
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const filteredMembers = members.filter(m =>
    `${m.fullName} ${m.email}`.toLowerCase().includes(normalizedQuery),
  );

  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("no_members")}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {members.length > 5 && (
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t("search_placeholder")}
        />
      )}

      {filteredMembers.length === 0 && (
        <p className="text-sm text-muted-foreground py-2">{t("no_results")}</p>
      )}

      <div className="flex flex-col divide-y-2 divide-accent/70 overflow-hidden">
        {filteredMembers.map(member => (
          <MemberRow
            key={member.id}
            member={member}
            currentUserRole={currentUserRole}
            workspaceId={workspaceId}
          />
        ))}
      </div>
    </div>
  );
}
