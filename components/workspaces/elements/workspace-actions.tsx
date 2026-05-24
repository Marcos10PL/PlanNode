import { useUser } from "@/components/providers/user-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Workspace } from "@/types/entities";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { DeleteWorkspaceModal } from "../delete-workspace-modal";
import { EditWorkspaceModal } from "../edit-workspace-modal";

export function WorkspaceActions({ workspace }: { workspace: Workspace }) {
  const t = useTranslations("profile_workspaces");
  const { user } = useUser();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            {t("edit")}
          </DropdownMenuItem>
          {workspace.owner_id === user?.id && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {t("delete")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <EditWorkspaceModal
        workspace={workspace}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteWorkspaceModal
        workspace={workspace}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
