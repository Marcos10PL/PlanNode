"use server";

import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/dto";

export async function updateLocaleAction(locale: Profile["locale"]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("profiles").update({ locale }).eq("id", user.id);
}
