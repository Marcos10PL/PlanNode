"use client";

import { updateProjectMembersAction } from "@/actions/project/update-project-members";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import UserAvatar from "@/components/user-avatar";
import { MANAGER_ROLES } from "@/const";
import { WorkspaceMember } from "@/types/dto";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  projectId: string;
  members: WorkspaceMember[];
  memberIds: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ManageProjectMembersModal({
  projectId,
  members,
  memberIds,
  open,
  onOpenChange,
}: Props) {
  const t = useTranslations("projects.members");
  const tCommon = useTranslations("common");
  const [selected, setSelected] = useState<string[]>(memberIds);
  const [isPending, setIsPending] = useState(false);

  const assignableMembers = members.filter(
    m => !MANAGER_ROLES.includes(m.role),
  );

  useEffect(() => {
    if (open) setSelected(memberIds);
  }, [open, memberIds]);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    setIsPending(true);
    try {
      const result = await updateProjectMembersAction(projectId, {
        memberIds: selected,
      });

      if (result.error) {
        toast.error(t("error"));
        return;
      }

      toast.success(t("success"));
      onOpenChange(false);
    } catch {
      toast.error(tCommon("unexpected_error"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onOpenChange(false)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        {assignableMembers.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        )}
        <div className="flex flex-col divide-y divide-accent/70 max-h-80 overflow-y-auto">
          {assignableMembers.map(member => (
            <label
              key={member.id}
              className="flex items-center gap-3 py-2 cursor-pointer"
            >
              <Checkbox
                checked={selected.includes(member.id)}
                onCheckedChange={() => toggle(member.id)}
              />
              <UserAvatar name={member.fullName} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">
                  {member.fullName}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {member.email}
                </p>
              </div>
            </label>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
