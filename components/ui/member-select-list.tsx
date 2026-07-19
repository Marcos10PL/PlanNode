"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRow } from "@/components/ui/user-row";
import { WorkspaceMember } from "@/types/dto";
import { cn } from "@/utils";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

type Props = {
  members: WorkspaceMember[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onClear?: () => void;
  multiple?: boolean;
  disabled?: boolean;
};

export function MemberSelectList({
  members,
  selectedIds,
  onSelect,
  onClear,
  multiple = false,
  disabled,
}: Props) {
  const t = useTranslations("team");
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const filteredMembers = members.filter(m =>
    `${m.fullName} ${m.email}`.toLowerCase().includes(normalizedQuery),
  );

  return (
    <div className="flex flex-col gap-2">
      {onClear && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || selectedIds.length === 0}
          onClick={onClear}
          className="justify-start px-2 font-normal text-muted-foreground"
        >
          <X className="h-4 w-4" />
          {t("clear_selection")}
        </Button>
      )}

      {members.length > 5 && (
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={t("search_placeholder")}
        />
      )}

      {filteredMembers.length === 0 && (
        <p className="text-xs text-muted-foreground px-1 pt-1">
          {t("no_results")}
        </p>
      )}

      <div
        role="listbox"
        aria-multiselectable={multiple}
        className="flex max-h-80 flex-col gap-2 overflow-y-auto"
      >
        {filteredMembers.map(member => {
          const isSelected = selectedIds.includes(member.id);

          return (
            <Button
              key={member.id}
              type="button"
              variant="ghost"
              role="option"
              aria-selected={isSelected}
              disabled={disabled}
              onClick={() => onSelect(member.id)}
              className={cn(
                "h-auto w-full justify-start gap-3 border rounded-xl px-2 py-0 font-normal text-left hover:bg-accent/50",
                isSelected && "border-primary/20 bg-primary/10!",
              )}
            >
              <UserRow
                userId={member.id}
                name={member.fullName}
                email={member.email}
                className="flex-1"
              />
              {isSelected && (
                <Check className="h-4 w-4 text-primary shrink-0 mr-2" />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
