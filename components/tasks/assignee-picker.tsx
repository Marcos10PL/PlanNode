"use client";

import { Button } from "@/components/ui/button";
import { MemberSelectList } from "@/components/ui/member-select-list";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UserAvatar from "@/components/user-avatar";
import { WorkspaceMember } from "@/types/dto";
import { ChevronDown, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type Props = {
  value: string | null;
  onChange: (id: string | null) => void;
  members: WorkspaceMember[];
  disabled?: boolean;
  trigger?: React.ReactNode;
  tooltip?: string;
  id?: string;
};

export function AssigneePicker({
  value,
  onChange,
  members,
  disabled,
  trigger,
  tooltip,
  id,
}: Props) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const selected = members.find(m => m.id === value) ?? null;

  const handleSelect = (memberId: string | null) => {
    onChange(memberId);
    setOpen(false);
  };

  const popoverTrigger = (
    <PopoverTrigger asChild>
      {trigger ?? (
        <Button
          type="button"
          variant="outline"
          id={id}
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          <span className="flex items-center gap-2 min-w-0">
            {selected ? (
              <>
                <UserAvatar name={selected.fullName} className="h-5 w-5" />
                <span className="truncate">{selected.fullName}</span>
              </>
            ) : (
              <span className="text-muted-foreground">
                {t("tasks.no_assignee")}
              </span>
            )}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      )}
    </PopoverTrigger>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger asChild>{popoverTrigger}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      ) : (
        popoverTrigger
      )}
      <PopoverContent className="w-80 p-2" align="end">
        <div className="flex flex-col gap-2">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start px-2 font-normal text-muted-foreground"
              onClick={() => handleSelect(null)}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
              {t("tasks.no_assignee")}
            </Button>
          )}

          <MemberSelectList
            members={members}
            selectedIds={value ? [value] : []}
            onSelect={handleSelect}
            disabled={disabled}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
