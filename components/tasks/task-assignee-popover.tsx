"use client";

import { updateTaskAction } from "@/actions/task/update-task";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/user-avatar";
import { TaskAssignee, WorkspaceMember } from "@/types/dto";
import { UserRoundPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { AssigneePicker } from "./assignee-picker";

type Props = {
  taskId: string;
  assignee: TaskAssignee | null;
  members: WorkspaceMember[];
  canEdit: boolean;
};

export function TaskAssigneePopover({
  taskId,
  assignee,
  members,
  canEdit,
}: Props) {
  const t = useTranslations();
  const [isPending, setIsPending] = useState(false);

  if (!canEdit) {
    return assignee ? (
      <UserAvatar name={assignee.fullName} className="h-7 w-7 shrink-0" />
    ) : null;
  }

  const handleChange = async (assigneeId: string | null) => {
    if (assigneeId === (assignee?.id ?? null)) return;

    setIsPending(true);
    try {
      const result = await updateTaskAction(taskId, { assigneeId });
      if (result?.error) toast.error(t("tasks.assignee_change_error"));
    } catch {
      toast.error(t("common.unexpected_error"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AssigneePicker
      value={assignee?.id ?? null}
      onChange={handleChange}
      members={members}
      disabled={isPending}
      tooltip={assignee ? assignee.fullName : t("tasks.assign")}
      trigger={
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 rounded-full"
          disabled={isPending}
        >
          {assignee ? (
            <UserAvatar name={assignee.fullName} className="h-7 w-7" />
          ) : (
            <UserRoundPlus className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      }
    />
  );
}
