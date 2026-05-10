"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { profileAccountSchema, ProfileAccountSchema } from "@/schema";
import { ERRORS } from "@/const";

export async function updateProfileAction(data: ProfileAccountSchema) {
  const parsed = profileAccountSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.invalidData };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.unauthorized };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: parsed.data.full_name || null })
    .eq("id", user.id);

  if (error) return { error: ERRORS.serverError };

  revalidatePath("/app/profile/settings");
  return { success: true };
}
