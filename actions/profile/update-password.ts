"use server";

import { createClient } from "@/lib/supabase/server";
import { updatePasswordSchema, UpdatePasswordSchema } from "@/schema";
import { ERRORS } from "@/const";

export async function updatePasswordAction(data: UpdatePasswordSchema) {
  const parsed = updatePasswordSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.invalidData };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.unauthorized };

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error?.code === "same_password") return { error: ERRORS.samePassword };
  if (error) return { error: ERRORS.serverError };

  return { success: true };
}
