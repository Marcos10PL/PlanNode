"use server";

import { ERRORS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/dto";

export async function updateLocaleAction(locale: Profile["locale"]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { error } = await supabase
    .from("profiles")
    .update({ locale })
    .eq("id", user.id);

  if (error) return { error: ERRORS.SERVER_ERROR };

  return { success: true };
}
