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
import { cn } from "@/utils";
import { ChevronDown } from "lucide-react";
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
  className?: string;
};

export function AssigneePicker({
  value,
  onChange,
  members,
  disabled,
  trigger,
  tooltip,
  id,
  className,
}: Props) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);

  const selected = members.find(m => m.id === value) ?? null;

  const handleSelect = (memberId: string) => {
    onChange(memberId === value ? null : memberId);
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
          className={cn(
            "w-full justify-between font-normal px-3 bg-transparent dark:bg-input/30 dark:hover:bg-input/50",
            className,
          )}
        >
          <span className="flex items-center gap-2 min-w-0">
            {selected ? (
              <>
                <UserAvatar
                  name={selected.fullName}
                  userId={selected.id}
                  className="h-5 w-5"
                />
                <span className="truncate">{selected.fullName}</span>
              </>
            ) : (
              <span className="text-muted-foreground">
                {t("tasks.no_assignee")}
              </span>
            )}
          </span>
          <ChevronDown className="ml-auto size-4 shrink-0 text-muted-foreground opacity-50" />
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
        <MemberSelectList
          members={members}
          selectedIds={value ? [value] : []}
          onSelect={handleSelect}
          onClear={() => {
            onChange(null);
            setOpen(false);
          }}
          disabled={disabled}
        />
      </PopoverContent>
    </Popover>
  );
}
