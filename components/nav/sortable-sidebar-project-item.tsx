"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DragHandle } from "@/components/ui/drag-handle";
import { ManageMenu } from "@/components/ui/manage-menu";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname } from "@/i18n/navigation";
import { ProjectListSummary, ProjectWithProgress } from "@/types/dto";
import {
  cn,
  getProjectColorBorderClass,
  getProjectColorTextClass,
  getProjectIcon,
  isActivePath,
} from "@/utils";
import { generateListRoute, generateProjectRoute } from "@/utils/helpers";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import {
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { SortableTaskListItem } from "./sortable-task-list-item";

type ListTarget = {
  projectId: string;
  list: ProjectListSummary;
};

type Props = {
  project: ProjectWithProgress;
  index: number;
  isActive: boolean;
  isExpanded: boolean;
  canManage: boolean;
  dragEnabled: boolean;
  onToggle: (projectId: string, open: boolean) => void;
  onLinkClick: () => void;
  onCreateList: (projectId: string) => void;
  onEditProject: (project: ProjectWithProgress) => void;
  onDeleteProject: (project: ProjectWithProgress) => void;
  onListDragEnd: (projectId: string) => (event: DragEndEvent) => void;
  onRenameList: (target: ListTarget) => void;
  onDeleteList: (target: ListTarget) => void;
};

export function SortableSidebarProjectItem({
  project,
  index,
  isActive,
  isExpanded,
  canManage,
  dragEnabled,
  onToggle,
  onLinkClick,
  onCreateList,
  onEditProject,
  onDeleteProject,
  onListDragEnd,
  onRenameList,
  onDeleteList,
}: Props) {
  const t = useTranslations();
  const pathname = usePathname();
  const { ref, handleRef, isDragging } = useSortable({
    id: project.id,
    index,
    disabled: !dragEnabled,
  });

  const projectRoute = generateProjectRoute(project.id);
  const ProjectIcon = getProjectIcon(project.icon);

  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={open => onToggle(project.id, open)}
      className="group/collapsible"
    >
      <SidebarMenuItem ref={ref} className={cn(isDragging && "opacity-50")}>
        {dragEnabled && (
          <DragHandle
            ref={handleRef}
            className="absolute -left-6.5 h-8 px-0.5 group-data-[collapsible=icon]:hidden ml-2"
          />
        )}
        <SidebarMenuButton asChild tooltip={project.name}>
          <Link
            href={projectRoute}
            className={cn(
              "group-hover/menu-item:pr-22! group-has-[.row-menu[data-state=open]]/menu-item:pr-22! ml-[.2rem]",
              isActive && "bg-accent text-accent-foreground",
            )}
            onClick={onLinkClick}
          >
            <ProjectIcon
              className={`mr-1 ${getProjectColorTextClass(project.color)}`}
            />
            <span className="truncate">{project.name}</span>
          </Link>
        </SidebarMenuButton>
        <div className="absolute right-1 top-0 flex h-8 items-center">
          {canManage && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuAction
                    className="static aspect-auto h-7 w-7 cursor-pointer opacity-0 group-hover/menu-item:opacity-100 hover:bg-foreground/20"
                    onClick={() => onCreateList(project.id)}
                  >
                    <Plus />
                  </SidebarMenuAction>
                </TooltipTrigger>
                <TooltipContent>
                  {t("tasks.list_create.trigger")}
                </TooltipContent>
              </Tooltip>
              <ManageMenu
                align="start"
                side="right"
                trigger={
                  <SidebarMenuAction className="row-menu static aspect-auto h-7 w-7 cursor-pointer opacity-0 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 hover:bg-foreground/20">
                    <MoreHorizontal />
                  </SidebarMenuAction>
                }
                items={[
                  {
                    label: t("projects.edit.trigger"),
                    icon: Pencil,
                    onClick: () => onEditProject(project),
                  },
                  {
                    label: t("projects.delete.trigger"),
                    icon: Trash2,
                    onClick: () => onDeleteProject(project),
                    destructive: true,
                  },
                ]}
              />
            </>
          )}
          <CollapsibleTrigger asChild>
            <SidebarMenuAction className="static aspect-auto h-7 w-7 cursor-pointer hover:bg-foreground/20 [&>svg]:transition-transform group-data-[state=open]/collapsible:[&>svg]:rotate-90">
              <ChevronRight />
            </SidebarMenuAction>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <DragDropProvider onDragEnd={onListDragEnd(project.id)}>
            <SidebarMenuSub
              className={cn(
                "mr-0 pr-0",
                getProjectColorBorderClass(project.color),
              )}
            >
              {project.lists.map((list, listIndex) => {
                const listRoute = generateListRoute(project.id, list.id);

                return (
                  <SortableTaskListItem
                    key={list.id}
                    id={list.id}
                    index={listIndex}
                    disabled={!canManage}
                  >
                    <SidebarMenuSubButton
                      asChild
                      isActive={isActivePath(pathname, listRoute)}
                      className="group-hover/list:pr-7 group-has-data-[state=open]/list:pr-7 pl-1.5!"
                    >
                      <Link href={listRoute} onClick={onLinkClick}>
                        <span className="flex-1 truncate">{list.name}</span>
                        <span className="text-xs text-muted-foreground group-hover/list:opacity-0 group-has-data-[state=open]/list:opacity-0">
                          {list.taskCount}
                        </span>
                      </Link>
                    </SidebarMenuSubButton>
                    {canManage && (
                      <ManageMenu
                        align="start"
                        side="right"
                        trigger={
                          <SidebarMenuAction className="top-0.5 size-6 aspect-auto cursor-pointer opacity-0 group-hover/list:opacity-100 data-[state=open]:opacity-100 hover:bg-foreground/20">
                            <MoreHorizontal />
                          </SidebarMenuAction>
                        }
                        items={[
                          {
                            label: t("tasks.list_rename.trigger"),
                            icon: Pencil,
                            onClick: () =>
                              onRenameList({ projectId: project.id, list }),
                          },
                          {
                            label: t("tasks.list_delete.trigger"),
                            icon: Trash2,
                            onClick: () =>
                              onDeleteList({ projectId: project.id, list }),
                            destructive: true,
                          },
                        ]}
                      />
                    )}
                  </SortableTaskListItem>
                );
              })}
            </SidebarMenuSub>
          </DragDropProvider>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
