"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MemberSelectList } from "@/components/ui/member-select-list";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SortSelect } from "@/components/ui/sort-select";
import { Switch } from "@/components/ui/switch";
import { TASK_PRIORITIES, TASK_SORTS } from "@/const";
import { Task, WorkspaceMember } from "@/types/dto";
import { TaskPriority } from "@/types/entities";
import { cn } from "@/utils";
import { Check, ChevronDown, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode, useState } from "react";
import { PriorityOptionLabel } from "./task-priority-select";

type TaskSort = (typeof TASK_SORTS)[keyof typeof TASK_SORTS];

export type TaskFiltersState = {
  query: string;
  priorities: TaskPriority[];
  assigneeIds: string[];
  unassigned: boolean;
  sort: TaskSort;
};

export const DEFAULT_TASK_FILTERS: TaskFiltersState = {
  query: "",
  priorities: [],
  assigneeIds: [],
  unassigned: false,
  sort: TASK_SORTS.DEFAULT,
};

const PRIORITY_RANK = {
  [TASK_PRIORITIES.URGENT]: 0,
  [TASK_PRIORITIES.HIGH]: 1,
  [TASK_PRIORITIES.MEDIUM]: 2,
  [TASK_PRIORITIES.LOW]: 3,
} as const satisfies Record<TaskPriority, number>;

const COMPARATORS = {
  [TASK_SORTS.DEFAULT]: (a, b) => a.position - b.position,
  [TASK_SORTS.DUE_DATE]: (a, b) => {
    if (!a.dueDate) return b.dueDate ? 1 : 0;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  },
  [TASK_SORTS.PRIORITY]: (a, b) =>
    PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority],
  [TASK_SORTS.NAME]: (a, b) => a.title.localeCompare(b.title),
} as const satisfies Record<TaskSort, (a: Task, b: Task) => number>;

export const filterTasks = (tasks: Task[], filters: TaskFiltersState) => {
  const query = filters.query.trim().toLowerCase();

  return tasks.filter(task => {
    if (query && !task.title.toLowerCase().includes(query)) return false;
    if (
      filters.priorities.length > 0 &&
      !filters.priorities.includes(task.priority)
    )
      return false;
    if (filters.assigneeIds.length > 0 || filters.unassigned) {
      const matchesMember =
        !!task.assigneeId && filters.assigneeIds.includes(task.assigneeId);
      const matchesUnassigned = filters.unassigned && !task.assigneeId;
      if (!matchesMember && !matchesUnassigned) return false;
    }
    return true;
  });
};

export const sortTasks = (tasks: Task[], sort: TaskSort) =>
  [...tasks].sort(COMPARATORS[sort]);

const toggle = <T,>(values: T[], value: T) =>
  values.includes(value) ? values.filter(v => v !== value) : [...values, value];

type Props = {
  members: WorkspaceMember[];
  filters: TaskFiltersState;
  onChange: (filters: TaskFiltersState) => void;
};

export function TaskFilters({ members, filters, onChange }: Props) {
  const t = useTranslations("tasks");
  const tTeam = useTranslations("team");
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);

  const update = (partial: Partial<TaskFiltersState>) =>
    onChange({ ...filters, ...partial });

  const priorityLabel =
    filters.priorities.length === 0 ? (
      t("filters.all_priorities")
    ) : filters.priorities.length === 1 ? (
      <PriorityOptionLabel priority={filters.priorities[0]} />
    ) : (
      t("filters.priorities_selected", { count: filters.priorities.length })
    );

  const selectedMembers = members.filter(m =>
    filters.assigneeIds.includes(m.id),
  );
  const assigneeCount = selectedMembers.length + (filters.unassigned ? 1 : 0);
  const membersLabel =
    assigneeCount === 0
      ? t("filters.all_assignees")
      : assigneeCount === 1
        ? filters.unassigned
          ? t("no_assignee")
          : selectedMembers[0].fullName
        : t("filters.members_selected", { count: assigneeCount });

  return (
    <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <Input
          value={filters.query}
          onChange={e => update({ query: e.target.value })}
          placeholder={t("filters.search_placeholder")}
          className="h-8 w-full lg:w-56"
        />

        <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center">
          <Popover open={priorityOpen} onOpenChange={setPriorityOpen}>
            <PopoverTrigger asChild>
              <FilterTrigger
                label={priorityLabel}
                isActive={filters.priorities.length > 0}
                className="w-full lg:w-46"
              />
            </PopoverTrigger>
            <PopoverContent className="w-46 p-1" align="start">
              <div className="flex flex-col">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={filters.priorities.length === 0}
                  onClick={() => {
                    update({ priorities: [] });
                    setPriorityOpen(false);
                  }}
                  className="justify-start px-2 font-normal text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                  {tTeam("clear_selection")}
                </Button>
                {Object.values(TASK_PRIORITIES).map(priority => {
                  const isSelected = filters.priorities.includes(priority);

                  return (
                    <Button
                      key={priority}
                      type="button"
                      variant="ghost"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() =>
                        update({
                          priorities: toggle(filters.priorities, priority),
                        })
                      }
                      className="justify-between h-8 px-2 font-normal"
                    >
                      <PriorityOptionLabel priority={priority} />
                      {isSelected && (
                        <Check className="size-4 text-muted-foreground" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={membersOpen} onOpenChange={setMembersOpen}>
            <PopoverTrigger asChild>
              <FilterTrigger
                label={membersLabel}
                isActive={assigneeCount > 0}
                className="w-full lg:w-54"
              />
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2" align="start">
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={assigneeCount === 0}
                  onClick={() => {
                    update({ assigneeIds: [], unassigned: false });
                    setMembersOpen(false);
                  }}
                  className="justify-start px-2 font-normal text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                  {tTeam("clear_selection")}
                </Button>

                <label className="flex cursor-pointer items-center gap-2 px-2 py-1 text-sm">
                  <Switch
                    checked={filters.unassigned}
                    onCheckedChange={unassigned => update({ unassigned })}
                  />
                  {t("no_assignee")}
                </label>

                <MemberSelectList
                  members={members}
                  selectedIds={filters.assigneeIds}
                  onSelect={id =>
                    update({ assigneeIds: toggle(filters.assigneeIds, id) })
                  }
                  multiple
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <SortSelect
          value={filters.sort}
          onChange={sort => update({ sort })}
          options={Object.values(TASK_SORTS)}
          getLabel={sort => t(`sort.${sort}`)}
        />
      </div>
    </div>
  );
}

type FilterTriggerProps = {
  label: ReactNode;
  isActive: boolean;
} & React.ComponentProps<typeof Button>;

function FilterTrigger({
  label,
  isActive,
  className,
  ...props
}: FilterTriggerProps) {
  return (
    <Button
      type="button"
      variant="outline"
      {...props}
      className={cn(
        "h-8 justify-between font-normal px-3 bg-transparent dark:bg-input/30 dark:hover:bg-input/50",
        !isActive && "text-muted-foreground",
        className,
      )}
    >
      <span className="truncate">{label}</span>
      <ChevronDown className="ml-auto size-4 shrink-0 text-muted-foreground opacity-50" />
    </Button>
  );
}
