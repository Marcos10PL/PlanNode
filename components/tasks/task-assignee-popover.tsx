"use client";

import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/user-avatar";
import { TaskAssignee, WorkspaceMember } from "@/types/dto";
import { UserRoundPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { AssigneePicker } from "./assignee-picker";

type Props = {
  assignee: TaskAssignee | null;
  members: WorkspaceMember[];
  canEdit: boolean;
  onChange: (assigneeId: string | null) => void;
};

export function TaskAssigneePopover({
  assignee,
  members,
  canEdit,
  onChange,
}: Props) {
  const t = useTranslations();

  if (!canEdit) {
    return assignee ? (
      <UserAvatar
        name={assignee.fullName}
        userId={assignee.id}
        className="h-7 w-7 shrink-0"
      />
    ) : null;
  }

  const handleChange = (assigneeId: string | null) => {
    if (assigneeId === (assignee?.id ?? null)) return;
    onChange(assigneeId);
  };

  return (
    <AssigneePicker
      value={assignee?.id ?? null}
      onChange={handleChange}
      members={members}
      tooltip={assignee ? assignee.fullName : t("tasks.assign")}
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 rounded-full"
        >
          {assignee ? (
            <UserAvatar
              name={assignee.fullName}
              userId={assignee.id}
              className="h-7 w-7"
            />
          ) : (
            <UserRoundPlus className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      }
    />
  );
}
