"use server";

import { ERRORS, LINKS, MANAGER_ROLES, WORKSPACE_ROLES } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { updateMemberRoleSchema, UpdateMemberRoleSchema } from "@/schema";
import { revalidatePath } from "next/cache";

export async function updateMemberRoleAction(
  workspaceId: string,
  memberId: string,
  data: UpdateMemberRoleSchema,
) {
  const parsed = updateMemberRoleSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: callerMember, error: callerMemberError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("id", user.id)
    .single();

  if (callerMemberError) return { error: ERRORS.SERVER_ERROR };

  if (!callerMember || !MANAGER_ROLES.includes(callerMember.role)) {
    return { error: ERRORS.INSUFFICIENT_ROLE };
  }

  const { data: targetMember, error: targetMemberError } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("id", memberId)
    .single();

  if (targetMemberError) return { error: ERRORS.SERVER_ERROR };

  if (targetMember?.role === WORKSPACE_ROLES.OWNER) {
    return { error: ERRORS.CANNOT_REMOVE_OWNER };
  }

  const { error } = await supabase
    .from("workspace_members")
    .update({ role: parsed.data.role })
    .eq("workspace_id", workspaceId)
    .eq("id", memberId);

  if (error) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(LINKS.TEAM);
  return { success: true };
}
