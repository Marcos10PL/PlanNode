"use server";

import { ERRORS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, LoginSchema } from "@/schema";

export async function loginAction(data: LoginSchema) {
  const parsed = loginSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.invalidData };

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.code === "invalid_credentials")
      return { error: ERRORS.invalidCredentials };
    if (error.code === "email_not_confirmed")
      return { error: ERRORS.emailNotConfirmed };

    return { error: ERRORS.serverError };
  }

  return { success: true };
}
