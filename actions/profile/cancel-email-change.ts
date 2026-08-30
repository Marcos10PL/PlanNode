"use server";

import { ERRORS } from "@/const";
import { getUserContext } from "@/lib/supabase/server";

export async function cancelEmailChangeAction() {
  const { supabase, user } = await getUserContext();
  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { error } = await supabase.rpc("cancel_email_change");

  if (error) return { error: ERRORS.SERVER_ERROR };

  return { success: true };
}
