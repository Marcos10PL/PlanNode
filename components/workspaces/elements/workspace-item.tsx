import { Workspace } from "@/types/dto";
import { WorkspaceActions } from "./workspace-actions";

export function WorkspaceItem({ workspace }: { workspace: Workspace }) {
  return (
    <div className="flex items-center justify-between rounded-md border px-4 py-3 text-sm w-full">
      <div className="min-w-0 flex-1 w-full flex flex-col gap-1">
        <p className="font-medium truncate">{workspace.name}</p>
        {workspace.description && (
          <p className="text-muted-foreground whitespace-normal break-all">
            {workspace.description}
          </p>
        )}
      </div>
      <div className="shrink-0 ml-4">
        <WorkspaceActions workspace={workspace} />
      </div>
    </div>
  );
}
