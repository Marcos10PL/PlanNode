"use client";

import { ProjectListSummary, ProjectWithProgress } from "@/types/dto";
import { DragEndEvent } from "@dnd-kit/react";
import { createContext, ReactNode, useContext } from "react";

export type ListTarget = {
  projectId: string;
  list: ProjectListSummary;
};

export type ProjectSidebarActions = {
  canManage: boolean;
  expandedIds: string[];
  toggleExpanded: (key: string, open: boolean) => void;
  isActive: (href: string) => string | false;
  onLinkClick: () => void;
  onCreateList: (projectId: string) => void;
  onEditProject: (project: ProjectWithProgress) => void;
  onDeleteProject: (project: ProjectWithProgress) => void;
  onListDragEnd: (projectId: string) => (event: DragEndEvent) => void;
  onRenameList: (target: ListTarget) => void;
  onDeleteList: (target: ListTarget) => void;
};

const ProjectSidebarActionsContext =
  createContext<ProjectSidebarActions | null>(null);

type ProviderProps = {
  value: ProjectSidebarActions;
  children: ReactNode;
};

export function ProjectSidebarActionsProvider({
  value,
  children,
}: ProviderProps) {
  return (
    <ProjectSidebarActionsContext.Provider value={value}>
      {children}
    </ProjectSidebarActionsContext.Provider>
  );
}

export function useProjectSidebarActions() {
  const context = useContext(ProjectSidebarActionsContext);

  if (!context) {
    throw new Error(
      "useProjectSidebarActions must be used within a ProjectSidebarActionsProvider",
    );
  }

  return context;
}
