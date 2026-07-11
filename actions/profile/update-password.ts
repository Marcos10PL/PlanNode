"use server";

import { getUserContext } from "@/lib/supabase/server";
import { updatePasswordSchema, UpdatePasswordSchema } from "@/schema";
import { ERRORS } from "@/const";

export async function updatePasswordAction(data: UpdatePasswordSchema) {
  const parsed = updatePasswordSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

  const { supabase, user } = await getUserContext();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error?.code === "same_password") return { error: ERRORS.SAME_PASSWORD };
  if (error) return { error: ERRORS.SERVER_ERROR };

  return { success: true };
}
