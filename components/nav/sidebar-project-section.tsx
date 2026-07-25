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
} from "@/components/ui/sidebar";
import { ProjectWithProgress } from "@/types/dto";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { ChevronRight } from "lucide-react";
import { useProjectSidebarActions } from "./project-sidebar-context";
import { SortableSidebarProjectItem } from "./sortable-sidebar-project-item";

type Props = {
  header: React.ReactNode;
  projects: ProjectWithProgress[];
  keyFor: (projectId: string) => string;
  onDragEnd: (event: DragEndEvent) => void;
  sectionKey: string;
};

export function SidebarProjectSection({
  header,
  projects,
  keyFor,
  onDragEnd,
  sectionKey,
}: Props) {
  const { canManage, expandedIds, toggleExpanded } = useProjectSidebarActions();

  const collapsedKey = `collapsed:${sectionKey}`;
  const isOpen = !expandedIds.includes(collapsedKey);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={open => toggleExpanded(collapsedKey, !open)}
      className="group/projects-section"
    >
      <SidebarGroup className="-mt-4">
        {header}

        <CollapsibleTrigger asChild>
          <SidebarGroupAction className="right-2.5 top-2.5 aspect-auto h-7 w-7 cursor-pointer hover:bg-foreground/20 [&>svg]:transition-transform group-data-[state=open]/projects-section:[&>svg]:rotate-90">
            <ChevronRight />
          </SidebarGroupAction>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <DragDropProvider onDragEnd={onDragEnd}>
            <SidebarMenu className="ml-3.5 w-auto border-l dark:border-white/20 pl-2 group-data-[collapsible=icon]:-ml-1 group-data-[collapsible=icon]:border-l-0 group-data-[collapsible=icon]:pl-0 pt-1">
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
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
