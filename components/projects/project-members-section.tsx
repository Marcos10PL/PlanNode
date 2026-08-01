"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserRow } from "@/components/ui/user-row";
import { WorkspaceMember } from "@/types/dto";
import { Settings, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ManageProjectMembersModal } from "./manage-project-members-modal";

type Props = {
  projectId: string;
  members: WorkspaceMember[];
  memberIds: string[];
  canManage: boolean;
};

export function ProjectMembersSection({
  projectId,
  members,
  memberIds,
  canManage,
}: Props) {
  const t = useTranslations();
  const [manageOpen, setManageOpen] = useState(false);

  const projectMembers = members.filter(m => memberIds.includes(m.id));

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-x-3">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">
          {t("projects.members.title")} ({projectMembers.length})
        </h2>
        {canManage && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setManageOpen(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t("projects.members.manage")}</TooltipContent>
          </Tooltip>
        )}
      </div>

      {projectMembers.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {t("projects.members.empty")}
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-accent/70">
          {projectMembers.map(member => (
            <UserRow
              key={member.id}
              userId={member.id}
              name={member.fullName}
              email={member.email}
              role={member.role}
              showBadge={false}
            />
          ))}
        </div>
      )}

      <ManageProjectMembersModal
        projectId={projectId}
        members={members}
        memberIds={memberIds}
        open={manageOpen}
        onOpenChange={setManageOpen}
      />
    </section>
  );
}
