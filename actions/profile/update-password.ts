"use server";

import { ERRORS } from "@/const";
import { getUserContext } from "@/lib/supabase/server";
import {
  updatePasswordWithCurrentSchema,
  UpdatePasswordWithCurrentSchema,
} from "@/schema";

export async function updatePasswordAction(
  data: UpdatePasswordWithCurrentSchema,
) {
  const parsed = updatePasswordWithCurrentSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

  const { supabase, user } = await getUserContext();
  if (!user || !user.email) return { error: ERRORS.UNAUTHENTICATED };

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });
  if (signInError) return { error: ERRORS.INVALID_CREDENTIALS };

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error?.code === "same_password") return { error: ERRORS.SAME_PASSWORD };
  if (error) return { error: ERRORS.SERVER_ERROR };

  return { success: true };
}
