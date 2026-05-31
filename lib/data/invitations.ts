import { INVITATION_STATUSES } from "@/const";
import { WorkspaceInvitation } from "@/types/entities";
import { cache } from "react";
import { createClient } from "../supabase/server";

export const getWorkspaceInvitations = cache(
  async (workspaceId: string): Promise<WorkspaceInvitation[]> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data } = await supabase
      .from("workspace_invitations")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("status", INVITATION_STATUSES.PENDING)
      .order("created_at", { ascending: false });

    return (data as WorkspaceInvitation[] | null) ?? [];
  },
);
