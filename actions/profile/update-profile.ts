"use server";

import { ERRORS, LINKS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { profileAccountSchema, ProfileAccountSchema } from "@/schema";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(data: ProfileAccountSchema) {
  const parsed = profileAccountSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name })
    .eq("id", user.id);

  if (error) return { error: ERRORS.SERVER_ERROR };

  revalidatePath(LINKS.PROFILE_SETTINGS);
  return { success: true };
}
