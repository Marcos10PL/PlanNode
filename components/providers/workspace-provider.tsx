"use client";

import { setActiveWorkspaceAction } from "@/actions/workspace/set-active-workspace";
import { Workspace } from "@/types/dto";

import {
  createContext,
  useCallback,
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
  const resolve = useCallback(
    () =>
      workspaces.find(w => w.id === activeWorkspaceId) ?? workspaces[0] ?? null,
    [workspaces, activeWorkspaceId],
  );

  const [activeWorkspace, setActive] = useState<Workspace | null>(resolve);

  const [prevActiveWorkspaceId, setPrevActiveWorkspaceId] =
    useState(activeWorkspaceId);
  const [prevWorkspaces, setPrevWorkspaces] = useState(workspaces);

  if (
    activeWorkspaceId !== prevActiveWorkspaceId ||
    workspaces !== prevWorkspaces
  ) {
    setPrevActiveWorkspaceId(activeWorkspaceId);
    setPrevWorkspaces(workspaces);
    setActive(resolve());
  }

  useEffect(() => {
    const resolved = resolve();
    if (resolved && resolved.id !== activeWorkspaceId)
      setActiveWorkspaceAction(resolved.id);
  }, [resolve, activeWorkspaceId]);

  const [isPending, startTransition] = useTransition();

  const setActiveWorkspace = (workspace: Workspace) => {
    setActive(workspace);
    startTransition(() => {
      void setActiveWorkspaceAction(workspace.id);
    });
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
