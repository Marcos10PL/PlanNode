"use client";

import { setActiveWorkspaceAction } from "@/actions/workspace/set-active-workspace";
import { Workspace } from "@/types/dto";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useTransition,
} from "react";

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
  const resolve = () =>
    workspaces.find(w => w.id === activeWorkspaceId) ?? workspaces[0] ?? null;

  const [activeWorkspace, setActive] = useState<Workspace | null>(resolve);

  useEffect(() => {
    const resolved = resolve();
    setActive(resolved);

    if (resolved && resolved.id !== activeWorkspaceId)
      setActiveWorkspaceAction(resolved.id);
  }, [activeWorkspaceId, workspaces]);

  const [isPending, startTransition] = useTransition();

  const setActiveWorkspace = (workspace: Workspace) => {
    setActive(workspace);
    startTransition(() => setActiveWorkspaceAction(workspace.id));
  };

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
