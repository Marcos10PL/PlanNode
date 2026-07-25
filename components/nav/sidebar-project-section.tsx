"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { ProjectWithProgress } from "@/types/dto";
import { cn } from "@/utils";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { ChevronRight, LucideIcon } from "lucide-react";
import Link from "next/link";
import { useProjectSidebarActions } from "./project-sidebar-context";
import { SortableSidebarProjectItem } from "./sortable-sidebar-project-item";

type Props = {
  href: string;
  label: string;
  icon: LucideIcon;
  projects: ProjectWithProgress[];
  keyFor: (projectId: string) => string;
  onDragEnd: (event: DragEndEvent) => void;
  sectionKey: string;
  emptyMessage: string;
};

export function SidebarProjectSection({
  href,
  label,
  icon: Icon,
  projects,
  keyFor,
  onDragEnd,
  sectionKey,
  emptyMessage,
}: Props) {
  const { canManage, expandedIds, toggleExpanded, isActive, onLinkClick } =
    useProjectSidebarActions();

  const collapsedKey = `collapsed:${sectionKey}`;
  const isOpen = !expandedIds.includes(collapsedKey);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={open => toggleExpanded(collapsedKey, !open)}
      className="group/projects-section"
    >
      <SidebarGroup className="-mt-4">
        <SidebarMenuButton asChild tooltip={label}>
          <Link
            href={href}
            onClick={onLinkClick}
            className={cn("pr-8", isActive(href))}
          >
            <Icon className="mr-1" />
            {label}
          </Link>
        </SidebarMenuButton>

        <CollapsibleTrigger asChild>
          <SidebarGroupAction className="right-2.5 top-2.5 aspect-auto h-7 w-7 cursor-pointer hover:bg-foreground/20 [&>svg]:transition-transform group-data-[state=open]/projects-section:[&>svg]:rotate-90 group-data-[collapsible=icon]:hidden">
            <ChevronRight />
          </SidebarGroupAction>
        </CollapsibleTrigger>

        <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
          {projects.length === 0 ? (
            <p className="ml-3.5 border-l dark:border-white/20 pl-4 py-1.5 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
              {emptyMessage}
            </p>
          ) : (
            <DragDropProvider onDragEnd={onDragEnd}>
              <SidebarMenu className="ml-3.5 w-auto border-l dark:border-white/20 pl-2 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:border-l-0 group-data-[collapsible=icon]:pl-0 pt-1">
                {projects.map((project, index) => (
                  <SortableSidebarProjectItem
                    key={project.id}
                    project={project}
                    index={index}
                    isExpanded={expandedIds.includes(keyFor(project.id))}
                    dragEnabled={canManage}
                    onToggle={(id, open) => toggleExpanded(keyFor(id), open)}
                  />
                ))}
              </SidebarMenu>
            </DragDropProvider>
          )}
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
