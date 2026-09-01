"use server";

import { ERRORS, LINKS } from "@/const";
import { findOwnedWorkspacesWithOtherMembers } from "@/lib/data/workspaces";
import { getUserContext } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { deleteAccountSchema, DeleteAccountSchema } from "@/schema";
import { redirect } from "next/navigation";

export async function deleteAccountAction(data: DeleteAccountSchema) {
  const parsed = deleteAccountSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

  const { supabase, user } = await getUserContext();

  if (!user || !user.email) return { error: ERRORS.UNAUTHENTICATED };

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.password,
  });
  if (signInError) return { error: ERRORS.INVALID_CREDENTIALS };

  const blockingWorkspaces = await findOwnedWorkspacesWithOtherMembers(
    supabase,
    user.id,
  );

  if (blockingWorkspaces.length > 0) {
    return {
      error: ERRORS.CANNOT_DELETE_ACCOUNT_AS_SOLE_OWNER,
      workspaces: blockingWorkspaces,
    };
  }

  const { error } = await createServiceClient().auth.admin.deleteUser(user.id);

  if (error) return { error: ERRORS.SERVER_ERROR };

  await supabase.auth.signOut();
  redirect(LINKS.LOGIN);
}
