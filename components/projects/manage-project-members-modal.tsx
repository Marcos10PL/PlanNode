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
import { Input } from "@/components/ui/input";
import { UserRow } from "@/components/ui/user-row";
import { MANAGER_ROLES } from "@/const";
import { WorkspaceMember } from "@/types/dto";
import { cn } from "@/utils";
import { Check } from "lucide-react";
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
  const [query, setQuery] = useState("");

  const assignableMembers = members.filter(
    m => !MANAGER_ROLES.includes(m.role),
  );

  const normalizedQuery = query.trim().toLowerCase();
  const filteredMembers = assignableMembers.filter(m =>
    `${m.fullName} ${m.email}`.toLowerCase().includes(normalizedQuery),
  );

  useEffect(() => {
    if (open) {
      setSelected(memberIds);
      setQuery("");
    }
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

        {assignableMembers.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        )}

        {assignableMembers.length > 5 && (
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t("search_placeholder")}
          />
        )}

        {assignableMembers.length > 0 && filteredMembers.length === 0 && (
          <p className="text-sm text-muted-foreground">{t("no_results")}</p>
        )}

        <div className="flex flex-col divide-y divide-accent/70 max-h-80 overflow-y-auto">
          {filteredMembers.map(member => (
            <label
              key={member.id}
              className={cn(
                "flex items-center gap-3 cursor-pointer border rounded-xl hover:bg-accent/50 px-2",
                selected.includes(member.id) && "border-primary/20 bg-primary/10!",
              )}
            >
              <Checkbox
                className="hidden"
                checked={selected.includes(member.id)}
                onCheckedChange={() => toggle(member.id)}
              />
              <UserRow
                userId={member.id}
                name={member.fullName}
                email={member.email}
                role={member.role}
                className="flex-1"
              />

              {selected.includes(member.id) && (
                <Check className="h-4 w-4 text-primary shrink-0 mr-2" />
              )}
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
          <Button onClick={handleSave} disabled={isPending || !isChanged}>
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
