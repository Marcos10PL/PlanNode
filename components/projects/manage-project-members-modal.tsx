"use client";

import { updateProjectMembersAction } from "@/actions/project/update-project-members";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MemberSelectList } from "@/components/ui/member-select-list";
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

  const isChanged =
    selected.length !== memberIds.length ||
    selected.some(id => !memberIds.includes(id));

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

        {assignableMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <MemberSelectList
            members={assignableMembers}
            selectedIds={selected}
            onSelect={toggle}
            multiple
            disabled={isPending}
          />
        )}

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={isPending || !isChanged}>
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
