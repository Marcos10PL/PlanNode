"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { useToggleProjectCompleted } from "@/hooks/use-toggle-project-completed";
import { useToggleProjectFavorite } from "@/hooks/use-toggle-project-favorite";
import { usePathname } from "@/i18n/navigation";
import { ProjectWithProgress } from "@/types/dto";
import {
  cn,
  getListManageMenuItems,
  getProjectColorBorderClass,
  getProjectColorTextClass,
  getProjectIcon,
  getProjectManageMenuItems,
  isActivePath,
} from "@/utils";
import { generateListRoute, generateProjectRoute } from "@/utils/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { ChevronRight, MoreHorizontal, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Ref } from "react";
import { useProjectSidebarActions } from "./project-sidebar-context";
import { SortableTaskListItem } from "./sortable-task-list-item";

type Props = {
  ref?: Ref<HTMLDivElement>;
  project: ProjectWithProgress;
  isExpanded: boolean;
  className?: string;
  dragHandle?: React.ReactNode;
  onToggle: (projectId: string, open: boolean) => void;
};

export function SidebarProjectItem({
  ref,
  project,
  isExpanded,
  className,
  dragHandle,
  onToggle,
}: Props) {
  const t = useTranslations();
  const tProjects = useTranslations("projects");
  const tTasks = useTranslations("tasks");
  const pathname = usePathname();
  const {
    canEdit,
    isActive,
    onLinkClick,
    onCreateList,
    onEditProject,
    onDeleteProject,
    onListDragEnd,
    onRenameList,
    onDeleteList,
  } = useProjectSidebarActions();

  const { isFavorite, toggle: toggleFavorite } = useToggleProjectFavorite(
    project.id,
    project.isFavorite,
  );
  const { isCompleted, toggle: toggleCompleted } = useToggleProjectCompleted(
    project.id,
    project.isCompleted,
  );
  const items = getProjectManageMenuItems({
    canEdit,
    isFavorite,
    onToggleFavorite: toggleFavorite,
    isCompleted,
    onToggleCompleted: toggleCompleted,
    onEdit: () => onEditProject(project),
    onDelete: () => onDeleteProject(project),
    t: tProjects,
  });

  const projectRoute = generateProjectRoute(project.id);
  const ProjectIcon = getProjectIcon(project.icon);

  return (
    <Collapsible
      ref={ref}
      open={isExpanded}
      onOpenChange={open => onToggle(project.id, open)}
      className={cn("group/collapsible", className)}
    >
      <SidebarMenuItem>
        {dragHandle}
        <SidebarMenuButton asChild tooltip={project.name}>
          <Link
            href={projectRoute}
            className={cn(
              "group-hover/menu-item:pr-22! group-has-[.row-menu[data-state=open]]/menu-item:pr-22!",
              isActive(projectRoute) && "bg-accent text-accent-foreground",
            )}
            onClick={onLinkClick}
          >
            <ProjectIcon
              className={`mr-1 ${getProjectColorTextClass(project.color)}`}
            />
            <span className="truncate">{project.name}</span>
          </Link>
        </SidebarMenuButton>
        <div className="absolute right-0.5 top-0.5 flex items-center">
          {canEdit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuAction
                  className="static aspect-auto h-7 w-7 cursor-pointer opacity-0 group-hover/menu-item:opacity-100 hover:bg-foreground/20"
                  onClick={() => onCreateList(project.id)}
                >
                  <Plus />
                </SidebarMenuAction>
              </TooltipTrigger>
              <TooltipContent>{t("tasks.list_create.trigger")}</TooltipContent>
            </Tooltip>
          )}
          <ManageMenu
            align="start"
            side="right"
            trigger={
              <SidebarMenuAction className="row-menu static aspect-auto h-7 w-7 cursor-pointer opacity-0 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 hover:bg-foreground/20">
                <MoreHorizontal />
              </SidebarMenuAction>
            }
            items={items}
          />
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
                    disabled={!canEdit}
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
                    {canEdit && (
                      <ManageMenu
                        align="start"
                        side="right"
                        trigger={
                          <SidebarMenuAction className="top-0.5 size-6 aspect-auto cursor-pointer opacity-0 group-hover/list:opacity-100 data-[state=open]:opacity-100 hover:bg-foreground/20">
                            <MoreHorizontal />
                          </SidebarMenuAction>
                        }
                        items={getListManageMenuItems({
                          canEdit,
                          onRename: () =>
                            onRenameList({ projectId: project.id, list }),
                          onDelete: () =>
                            onDeleteList({ projectId: project.id, list }),
                          t: tTasks,
                        })}
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
