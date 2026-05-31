"use server";

import { ERRORS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { updatePasswordSchema, UpdatePasswordSchema } from "@/schema";

export async function updatePasswordAction(data: UpdatePasswordSchema) {
  const parsed = updatePasswordSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.invalidData };

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) return { error: ERRORS.serverError };

  return { success: true };
}
