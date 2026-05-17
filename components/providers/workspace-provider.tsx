"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { Workspace } from "@/types/entities";
import { setActiveWorkspaceAction } from "@/actions/workspace/set-active-workspace";

type WorkspaceContextValue = {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => void;
  isPending: boolean;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  workspaces,
  activeWorkspaceId,
  children,
}: {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  children: React.ReactNode;
}) {
  const initial =
    workspaces.find(w => w.id === activeWorkspaceId) ?? workspaces[0] ?? null;

  const [activeWorkspace, setActive] = useState<Workspace | null>(initial);
  const [isPending, startTransition] = useTransition();

  function setActiveWorkspace(workspace: Workspace) {
    setActive(workspace);
    startTransition(() => setActiveWorkspaceAction(workspace.id));
  }

  return (
    <WorkspaceContext
      value={{ workspaces, activeWorkspace, setActiveWorkspace, isPending }}
    >
      {children}
    </WorkspaceContext>
  );
}

export function useWorkspaces() {
  const context = useContext(WorkspaceContext);
  if (!context)
    throw new Error("useWorkspaces must be used within WorkspaceProvider");
  return context;
}
